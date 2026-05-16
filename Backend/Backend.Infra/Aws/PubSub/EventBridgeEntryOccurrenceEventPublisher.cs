using System.Text.Json;
using Amazon.EventBridge;
using Amazon.EventBridge.Model;
using Backend.Application.Contracts.PubSub;
using Backend.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace Backend.Infra.Aws.PubSub;

public class EventBridgeEntryOccurrenceEventPublisher : IEntryOccurrenceEventPublisher
{
    private readonly IAmazonEventBridge _amazonEventBridge;
    private readonly IConfiguration _configuration;

    public EventBridgeEntryOccurrenceEventPublisher(IAmazonEventBridge amazonEventBridge, IConfiguration configuration)
    {
        _amazonEventBridge = amazonEventBridge;
        _configuration = configuration;
    }

    public async Task PublishUpsertedAsync(EntryOccurrence entryOccurrence, CancellationToken cancellationToken)
    {
        var request = new PutEventsRequest
        {
            Entries =
            [
                new PutEventsRequestEntry
                {
                    EventBusName = _configuration["EventBridge:EventBusName"],
                    Source = _configuration["EventBridge:Source"],
                    DetailType = _configuration["EventBridge:DetailTypes:EntryOccurrenceUpserted"],
                    Detail = JsonSerializer.Serialize(entryOccurrence)
                }
            ]
        };
        var response = await _amazonEventBridge.PutEventsAsync(request, cancellationToken);
        
        if (response.FailedEntryCount > 0)
        {
            // TODO: handle error
            throw new Exception("Failed to publish events");
        }
    }
}