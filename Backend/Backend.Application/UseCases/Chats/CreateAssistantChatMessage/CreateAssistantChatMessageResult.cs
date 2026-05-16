using Backend.Domain.Entities;

namespace Backend.Application.UseCases.Chats.CreateAssistantChatMessage;

public sealed record CreateAssistantChatMessageResult(
    Guid MessageId,
    Guid ChatId,
    Guid TraceId,
    ChatMessageStatus Status,
    DateTime CreatedAt
);
