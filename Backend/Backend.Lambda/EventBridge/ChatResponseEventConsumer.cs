using System.Text.Json;
using Amazon.SQS;
using Amazon.SQS.Model;
using Backend.Application.Contracts.PubSub;
using Backend.Application.UseCases.Chats.CreateAssistantChatMessage;
using MediatR;

namespace Backend.Lambda.EventBridge;

public sealed class ChatResponseEventConsumer : BackgroundService
{
    private readonly IAmazonSQS _amazonSqs;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ChatResponseEventConsumer> _logger;

    public ChatResponseEventConsumer(
        IAmazonSQS amazonSqs,
        IServiceScopeFactory serviceScopeFactory,
        IConfiguration configuration,
        ILogger<ChatResponseEventConsumer> logger)
    {
        _amazonSqs = amazonSqs;
        _serviceScopeFactory = serviceScopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var queueUrl = _configuration["EventBridge:QueueUrls:AssistantMessagesQueueUrl"];

        if (string.IsNullOrWhiteSpace(queueUrl))
        {
            _logger.LogInformation("Assistant message queue is not configured. Chat response consumer will stay idle.");
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
                _logger.LogError(exception, "Failed while polling assistant message queue");
                await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);
            }
        }
    }

    private async Task ProcessMessageAsync(
        string queueUrl,
        Message message,
        CancellationToken cancellationToken)
    {
        var envelope = JsonSerializer.Deserialize<EventBridgeEnvelope>(
            message.Body,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        if (envelope is null)
        {
            throw new InvalidOperationException("Could not deserialize EventBridge envelope");
        }

        if (!string.Equals(envelope.DetailType, "ScheduleAssistantMessageCreated", StringComparison.Ordinal))
        {
            await DeleteMessageAsync(queueUrl, message, cancellationToken);
            return;
        }

        var detail = envelope.Detail.Deserialize<AssistantMessageCreatedIntegrationEvent>(
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        if (detail is null)
        {
            throw new InvalidOperationException("Could not deserialize assistant message detail");
        }

        using var scope = _serviceScopeFactory.CreateScope();
        var sender = scope.ServiceProvider.GetRequiredService<ISender>();

        var result = await sender.Send(
            new CreateAssistantChatMessageCommand(detail.ChatId, detail.TraceId, detail.Content),
            cancellationToken);

        if (result.IsFailure)
        {
            throw new InvalidOperationException(result.Error.Message);
        }

        await DeleteMessageAsync(queueUrl, message, cancellationToken);
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
