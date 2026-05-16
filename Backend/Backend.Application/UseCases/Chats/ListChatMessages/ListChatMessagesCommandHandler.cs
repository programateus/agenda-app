using Backend.Application.Common.Errors;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Chats.ListChatMessages;

public sealed class ListChatMessagesCommandHandler
    : IRequestHandler<ListChatMessagesCommand, Result<ListChatMessagesResult, ApiError>>
{
    private readonly IChatRepository _chatRepository;
    private readonly IChatMessageRepository _chatMessageRepository;

    public ListChatMessagesCommandHandler(
        IChatRepository chatRepository,
        IChatMessageRepository chatMessageRepository)
    {
        _chatRepository = chatRepository;
        _chatMessageRepository = chatMessageRepository;
    }

    public async Task<Result<ListChatMessagesResult, ApiError>> Handle(
        ListChatMessagesCommand request,
        CancellationToken cancellationToken)
    {
        var chat = await _chatRepository.FindByIdAsync(request.ChatId, cancellationToken);
        if (chat is null || chat.UserId != request.UserId)
        {
            return Result.Failure<ListChatMessagesResult, ApiError>(new NotFoundError("Chat not found"));
        }

        var messages = await _chatMessageRepository.GetByChatIdAsync(request.ChatId, cancellationToken);
        return Result.Success<ListChatMessagesResult, ApiError>(new ListChatMessagesResult(messages));
    }
}
