using Backend.Application.Common.Errors;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Chats.ListChats;

public sealed record ListChatsCommand(Guid UserId) : IRequest<Result<ListChatsResult, ApiError>>;
