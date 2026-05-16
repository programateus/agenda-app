using Backend.Application.Common.Errors;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Chats.CreateChatMessage;

public sealed record CreateChatMessageCommand(Guid ChatId, Guid UserId, string Content)
    : IRequest<Result<CreateChatMessageResult, ApiError>>;
