using Backend.Application.Common.Errors;
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

    public CreateChatMessageCommandHandler(
        IChatRepository chatRepository,
        IChatMessageRepository chatMessageRepository)
    {
        _chatRepository = chatRepository;
        _chatMessageRepository = chatMessageRepository;
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

        return Result.Success<CreateChatMessageResult, ApiError>(
            new CreateChatMessageResult(message.Id, message.ChatId, message.TraceId, message.Status, message.CreatedAt)
        );
    }
}
