using Backend.Application.Common.Errors;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Chats.ListChatMessages;

public sealed record ListChatMessagesCommand(Guid ChatId, Guid UserId)
    : IRequest<Result<ListChatMessagesResult, ApiError>>;
