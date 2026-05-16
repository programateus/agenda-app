using Backend.Application.Common.Errors;
using Backend.Domain.Entities;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Chats.CreateChat;

public sealed class CreateChatCommandHandler : IRequestHandler<CreateChatCommand, Result<CreateChatResult, ApiError>>
{
    private readonly IUserRepository _userRepository;
    private readonly IChatRepository _chatRepository;

    public CreateChatCommandHandler(IUserRepository userRepository, IChatRepository chatRepository)
    {
        _userRepository = userRepository;
        _chatRepository = chatRepository;
    }

    public async Task<Result<CreateChatResult, ApiError>> Handle(
        CreateChatCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.FindByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return Result.Failure<CreateChatResult, ApiError>(new NotFoundError("User not found"));
        }

        var chat = new Chat(request.UserId, ChatStatus.Active, DateTime.UtcNow);
        await _chatRepository.CreateAsync(chat, cancellationToken);

        return Result.Success<CreateChatResult, ApiError>(
            new CreateChatResult(chat.Id, chat.Status, chat.LastMessageAt, chat.CreatedAt, chat.UpdatedAt)
        );
    }
}
