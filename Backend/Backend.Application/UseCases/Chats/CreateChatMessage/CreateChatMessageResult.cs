using Backend.Domain.Entities;

namespace Backend.Application.UseCases.Chats.CreateChatMessage;

public sealed record CreateChatMessageResult(
    Guid MessageId,
    Guid ChatId,
    Guid TraceId,
    ChatMessageStatus Status,
    DateTime CreatedAt
);
