namespace Backend.Application.Contracts.PubSub;

public interface IChatMessageEventPublisher
{
    Task PublishCreatedAsync(ChatMessageCreatedIntegrationEvent chatMessage, CancellationToken cancellationToken);
}
