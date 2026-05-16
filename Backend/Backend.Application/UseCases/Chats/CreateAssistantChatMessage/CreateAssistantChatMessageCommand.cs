using Backend.Application.Common.Errors;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Chats.CreateAssistantChatMessage;

public sealed record CreateAssistantChatMessageCommand(Guid ChatId, Guid TraceId, string Content)
    : IRequest<Result<CreateAssistantChatMessageResult, ApiError>>;
