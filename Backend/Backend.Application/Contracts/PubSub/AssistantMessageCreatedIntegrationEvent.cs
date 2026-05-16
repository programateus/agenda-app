namespace Backend.Application.Contracts.PubSub;

public sealed record AssistantMessageCreatedIntegrationEvent(
    Guid ChatId,
    Guid TraceId,
    string Content,
    DateTime CreatedAt
);
