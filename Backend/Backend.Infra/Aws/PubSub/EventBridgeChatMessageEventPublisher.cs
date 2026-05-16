using System.Text.Json;
using Amazon.EventBridge;
using Amazon.EventBridge.Model;
using Backend.Application.Contracts.PubSub;
using Microsoft.Extensions.Configuration;

namespace Backend.Infra.Aws.PubSub;

public sealed class EventBridgeChatMessageEventPublisher : IChatMessageEventPublisher
{
    private readonly IAmazonEventBridge _amazonEventBridge;
    private readonly IConfiguration _configuration;

    public EventBridgeChatMessageEventPublisher(IAmazonEventBridge amazonEventBridge, IConfiguration configuration)
    {
        _amazonEventBridge = amazonEventBridge;
        _configuration = configuration;
    }

    public async Task PublishCreatedAsync(
        ChatMessageCreatedIntegrationEvent chatMessage,
        CancellationToken cancellationToken)
    {
        var request = new PutEventsRequest
        {
            Entries =
            [
                new PutEventsRequestEntry
                {
                    EventBusName = _configuration["EventBridge:EventBusName"],
                    Source = _configuration["EventBridge:Source"],
                    DetailType = _configuration["EventBridge:DetailTypes:ChatMessageCreated"],
                    Detail = JsonSerializer.Serialize(chatMessage)
                }
            ]
        };

        var response = await _amazonEventBridge.PutEventsAsync(request, cancellationToken);

        if (response.FailedEntryCount > 0)
        {
            throw new Exception("Failed to publish events");
        }
    }
}
