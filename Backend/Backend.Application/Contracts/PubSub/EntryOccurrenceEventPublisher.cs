using Backend.Domain.Entities;

namespace Backend.Application.Contracts.PubSub;

public interface IEntryOccurrenceEventPublisher
{
    Task PublishUpsertedAsync(EntryOccurrence entryOccurrence, CancellationToken cancellationToken);
}