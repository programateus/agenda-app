using Backend.Application.Common.Errors;
using Backend.Application.Contracts.PubSub;
using Backend.Domain.Entities;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Chats.CreateChatMessage;

public sealed class CreateChatMessageCommandHandler
    : IRequestHandler<CreateChatMessageCommand, Result<CreateChatMessageResult, ApiError>>
{
    private readonly IChatRepository _chatRepository;
    private readonly IChatMessageRepository _chatMessageRepository;
    private readonly IChatMessageEventPublisher _chatMessageEventPublisher;

    public CreateChatMessageCommandHandler(
        IChatRepository chatRepository,
        IChatMessageRepository chatMessageRepository,
        IChatMessageEventPublisher chatMessageEventPublisher)
    {
        _chatRepository = chatRepository;
        _chatMessageRepository = chatMessageRepository;
        _chatMessageEventPublisher = chatMessageEventPublisher;
    }

    public async Task<Result<CreateChatMessageResult, ApiError>> Handle(
        CreateChatMessageCommand request,
        CancellationToken cancellationToken)
    {
        var chat = await _chatRepository.FindByIdAsync(request.ChatId, cancellationToken);
        if (chat is null || chat.UserId != request.UserId)
        {
            return Result.Failure<CreateChatMessageResult, ApiError>(new NotFoundError("Chat not found"));
        }

        var message = new ChatMessage(
            request.ChatId,
            SenderRole.User,
            request.Content,
            ChatMessageStatus.Completed,
            Guid.NewGuid(),
            string.Empty
        );

        await _chatMessageRepository.CreateAsync(message, cancellationToken);

        chat.RegisterMessage(message.CreatedAt);
        await _chatRepository.UpdateAsync(chat, cancellationToken);

        await _chatMessageEventPublisher.PublishCreatedAsync(
            new ChatMessageCreatedIntegrationEvent(
                message.Id,
                message.ChatId,
                request.UserId,
                message.TraceId,
                message.Content,
                message.CreatedAt
            ),
            cancellationToken
        );

        return Result.Success<CreateChatMessageResult, ApiError>(
            new CreateChatMessageResult(message.Id, message.ChatId, message.TraceId, message.Status, message.CreatedAt)
        );
    }
}
