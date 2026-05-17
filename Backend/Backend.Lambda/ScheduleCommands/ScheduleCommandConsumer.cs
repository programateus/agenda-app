using System.Text.Json;
using Amazon.SQS;
using Amazon.SQS.Model;
using Backend.Application.Contracts.Realtime;
using Backend.Application.UseCases.Chats.CreateAssistantChatMessage;
using Backend.Application.UseCases.Entries.CreateEntry;
using Backend.Application.UseCases.Entries.DeleteEntry;
using Backend.Application.UseCases.Entries.UpdateEntry;
using Backend.Domain.Entities;
using MediatR;

namespace Backend.Lambda.ScheduleCommands;

public sealed class ScheduleCommandConsumer : BackgroundService
{
    private readonly IAmazonSQS _amazonSqs;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ScheduleCommandConsumer> _logger;

    public ScheduleCommandConsumer(
        IAmazonSQS amazonSqs,
        IServiceScopeFactory serviceScopeFactory,
        IConfiguration configuration,
        ILogger<ScheduleCommandConsumer> logger)
    {
        _amazonSqs = amazonSqs;
        _serviceScopeFactory = serviceScopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var queueUrl = _configuration["EventBridge:QueueUrls:ScheduleCommandsQueueUrl"];

        if (string.IsNullOrWhiteSpace(queueUrl))
        {
            _logger.LogInformation("Schedule command queue is not configured. Command consumer will stay idle.");
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var response = await _amazonSqs.ReceiveMessageAsync(
                    new ReceiveMessageRequest
                    {
                        QueueUrl = queueUrl,
                        MaxNumberOfMessages = 10,
                        WaitTimeSeconds = 10
                    },
                    stoppingToken
                );

                var messages = response.Messages ?? [];

                foreach (var message in messages)
                {
                    await ProcessMessageAsync(queueUrl, message, stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Failed while polling schedule command queue");
                await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);
            }
        }
    }

    private async Task ProcessMessageAsync(
        string queueUrl,
        Message message,
        CancellationToken cancellationToken)
    {
        var command = JsonSerializer.Deserialize<ScheduleCommandMessage>(
            message.Body,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        if (command is null)
        {
            throw new InvalidOperationException("Could not deserialize schedule command message");
        }

        using var scope = _serviceScopeFactory.CreateScope();
        var sender = scope.ServiceProvider.GetRequiredService<ISender>();
        var calendarEventsNotifier = scope.ServiceProvider.GetRequiredService<ICalendarEventsNotifier>();

        try
        {
            var errorMessage = await ExecuteCommandAsync(command, sender, cancellationToken);

            if (errorMessage is not null)
            {
                await NotifyAssistantAsync(
                    sender,
                    command.ChatId,
                    command.TraceId,
                    errorMessage,
                    cancellationToken);

                await DeleteMessageAsync(queueUrl, message, cancellationToken);
                return;
            }

            await NotifyAssistantAsync(
                sender,
                command.ChatId,
                command.TraceId,
                command.SuccessMessage,
                cancellationToken);

            await calendarEventsNotifier.NotifyEntriesChangedAsync(command.UserId, cancellationToken);
            await DeleteMessageAsync(queueUrl, message, cancellationToken);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to execute schedule command {Operation} for chat {ChatId}", command.Operation, command.ChatId);

            await NotifyAssistantAsync(
                sender,
                command.ChatId,
                command.TraceId,
                BuildFailureMessage(command.Operation, exception.Message),
                cancellationToken);

            await DeleteMessageAsync(queueUrl, message, cancellationToken);
        }
    }

    private async Task<string?> ExecuteCommandAsync(
        ScheduleCommandMessage command,
        ISender sender,
        CancellationToken cancellationToken)
    {
        switch (command.Operation.Trim().ToLowerInvariant())
        {
            case "create":
                return await ExecuteCreateAsync(command, sender, cancellationToken);
            case "update":
                return await ExecuteUpdateAsync(command, sender, cancellationToken);
            case "delete":
                return await ExecuteDeleteAsync(command, sender, cancellationToken);
            default:
                return BuildFailureMessage(command.Operation, "Operacao nao suportada.");
        }
    }

    private async Task<string?> ExecuteCreateAsync(
        ScheduleCommandMessage command,
        ISender sender,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.Title) ||
            command.StartDate is null ||
            command.EndDate is null ||
            !TryParseFrequency(command.Frequency, out var frequency))
        {
            return BuildFailureMessage(command.Operation, "Dados insuficientes para criar o evento.");
        }

        var result = await sender.Send(
            new CreateEntryCommand(
                command.Title,
                command.StartDate.Value,
                command.EndDate.Value,
                command.Until,
                frequency,
                command.UserId
            ),
            cancellationToken);

        return result.IsFailure
            ? BuildFailureMessage(command.Operation, result.Error.Message)
            : null;
    }

    private async Task<string?> ExecuteUpdateAsync(
        ScheduleCommandMessage command,
        ISender sender,
        CancellationToken cancellationToken)
    {
        if (command.EntryId is null ||
            string.IsNullOrWhiteSpace(command.Title) ||
            command.StartDate is null ||
            command.EndDate is null ||
            command.OriginalStartDate is null ||
            !TryParseFrequency(command.Frequency, out var frequency) ||
            !TryParseUpdateScope(command.Scope, out var scope))
        {
            return BuildFailureMessage(command.Operation, "Dados insuficientes para atualizar o evento.");
        }

        var result = await sender.Send(
            new UpdateEntryCommand(
                command.EntryId.Value,
                command.Title,
                command.StartDate.Value,
                command.EndDate.Value,
                command.Until,
                frequency,
                command.UserId,
                scope,
                command.OriginalStartDate.Value
            ),
            cancellationToken);

        return result.IsFailure
            ? BuildFailureMessage(command.Operation, result.Error.Message)
            : null;
    }

    private async Task<string?> ExecuteDeleteAsync(
        ScheduleCommandMessage command,
        ISender sender,
        CancellationToken cancellationToken)
    {
        if (command.EntryId is null ||
            command.OriginalStartDate is null ||
            !TryParseDeleteScope(command.Scope, out var scope))
        {
            return BuildFailureMessage(command.Operation, "Dados insuficientes para remover o evento.");
        }

        var result = await sender.Send(
            new DeleteEntryCommand(
                command.EntryId.Value,
                command.UserId,
                command.OriginalStartDate.Value,
                scope
            ),
            cancellationToken);

        return result.IsFailure
            ? BuildFailureMessage(command.Operation, result.Error.Message)
            : null;
    }

    private static bool TryParseFrequency(string? value, out Frequency frequency)
    {
        return Enum.TryParse(value, true, out frequency);
    }

    private static bool TryParseUpdateScope(string? value, out UpdateScope scope)
    {
        return Enum.TryParse(value, true, out scope);
    }

    private static bool TryParseDeleteScope(string? value, out DeleteScope scope)
    {
        return Enum.TryParse(value, true, out scope);
    }

    private static string BuildFailureMessage(string operation, string reason)
    {
        var normalizedOperation = operation.Trim().ToLowerInvariant();

        return normalizedOperation switch
        {
            "create" => $"Nao consegui criar o evento. {reason}",
            "update" => $"Nao consegui atualizar o evento. {reason}",
            "delete" => $"Nao consegui remover o evento. {reason}",
            _ => $"Nao consegui processar a operacao solicitada. {reason}"
        };
    }

    private static async Task NotifyAssistantAsync(
        ISender sender,
        Guid chatId,
        Guid traceId,
        string content,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreateAssistantChatMessageCommand(chatId, traceId, content),
            cancellationToken);

        if (result.IsFailure)
        {
            throw new InvalidOperationException(result.Error.Message);
        }
    }

    private Task DeleteMessageAsync(string queueUrl, Message message, CancellationToken cancellationToken)
    {
        return _amazonSqs.DeleteMessageAsync(
            new DeleteMessageRequest
            {
                QueueUrl = queueUrl,
                ReceiptHandle = message.ReceiptHandle
            },
            cancellationToken);
    }
}
