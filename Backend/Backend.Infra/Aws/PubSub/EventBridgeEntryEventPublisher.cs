using System.Text.Json;
using Amazon.EventBridge;
using Amazon.EventBridge.Model;
using Backend.Application.Contracts.PubSub;
using Backend.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace Backend.Infra.Aws.PubSub;

public class EventBridgeEntryEventPublisher: IEntryEventPublisher
{
    private readonly IAmazonEventBridge _amazonEventBridge;
    private readonly IConfiguration _configuration;

    public EventBridgeEntryEventPublisher(IAmazonEventBridge amazonEventBridge, IConfiguration configuration)
    {
        _amazonEventBridge = amazonEventBridge;
        _configuration = configuration;
    }


    public async Task PublishCreatedAsync(Entry entry, CancellationToken cancellationToken)
    {
        var request = new PutEventsRequest
        {
            Entries =
            [
                new PutEventsRequestEntry
                {
                    EventBusName = _configuration["EventBridge:EventBusName"],
                    Source = _configuration["EventBridge:Source"],
                    DetailType = _configuration["EventBridge:DetailTypes:EntryCreated"],
                    Detail = JsonSerializer.Serialize(entry)
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

    public async Task PublishUpdatedAsync(Entry entry, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task PublishDeletedAsync(Guid entryId, Guid userId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}