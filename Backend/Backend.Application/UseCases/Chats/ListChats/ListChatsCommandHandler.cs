using Backend.Application.Common.Errors;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Chats.ListChats;

public sealed class ListChatsCommandHandler : IRequestHandler<ListChatsCommand, Result<ListChatsResult, ApiError>>
{
    private readonly IChatRepository _chatRepository;

    public ListChatsCommandHandler(IChatRepository chatRepository)
    {
        _chatRepository = chatRepository;
    }

    public async Task<Result<ListChatsResult, ApiError>> Handle(
        ListChatsCommand request,
        CancellationToken cancellationToken)
    {
        var chats = await _chatRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        return Result.Success<ListChatsResult, ApiError>(new ListChatsResult(chats));
    }
}
