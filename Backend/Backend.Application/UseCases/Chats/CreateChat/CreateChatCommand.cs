using Backend.Application.Common.Errors;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Chats.CreateChat;

public sealed record CreateChatCommand(Guid UserId) : IRequest<Result<CreateChatResult, ApiError>>;
