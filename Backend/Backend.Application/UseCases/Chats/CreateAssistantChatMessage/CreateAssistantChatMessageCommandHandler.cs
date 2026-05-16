using Backend.Application.Common.Errors;
using Backend.Application.Contracts.Realtime;
using Backend.Domain.Entities;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Chats.CreateAssistantChatMessage;

public sealed class CreateAssistantChatMessageCommandHandler
    : IRequestHandler<CreateAssistantChatMessageCommand, Result<CreateAssistantChatMessageResult, ApiError>>
{
    private readonly IChatRepository _chatRepository;
    private readonly IChatMessageRepository _chatMessageRepository;
    private readonly IChatMessageNotifier _chatMessageNotifier;

    public CreateAssistantChatMessageCommandHandler(
        IChatRepository chatRepository,
        IChatMessageRepository chatMessageRepository,
        IChatMessageNotifier chatMessageNotifier)
    {
        _chatRepository = chatRepository;
        _chatMessageRepository = chatMessageRepository;
        _chatMessageNotifier = chatMessageNotifier;
    }

    public async Task<Result<CreateAssistantChatMessageResult, ApiError>> Handle(
        CreateAssistantChatMessageCommand request,
        CancellationToken cancellationToken)
    {
        var chat = await _chatRepository.FindByIdAsync(request.ChatId, cancellationToken);
        if (chat is null)
        {
            return Result.Failure<CreateAssistantChatMessageResult, ApiError>(new NotFoundError("Chat not found"));
        }

        var message = new ChatMessage(
            request.ChatId,
            SenderRole.Assistant,
            request.Content,
            ChatMessageStatus.Completed,
            request.TraceId,
            string.Empty
        );

        await _chatMessageRepository.CreateAsync(message, cancellationToken);

        chat.RegisterMessage(message.CreatedAt);
        await _chatRepository.UpdateAsync(chat, cancellationToken);

        await _chatMessageNotifier.NotifyMessageCreatedAsync(message, cancellationToken);

        return Result.Success<CreateAssistantChatMessageResult, ApiError>(
            new CreateAssistantChatMessageResult(
                message.Id,
                message.ChatId,
                message.TraceId,
                message.Status,
                message.CreatedAt
            )
        );
    }
}
