namespace Backend.Application.Contracts.PubSub;

public sealed record ChatMessageCreatedIntegrationEvent(
    Guid MessageId,
    Guid ChatId,
    Guid UserId,
    Guid TraceId,
    string Content,
    DateTime CreatedAt
);
