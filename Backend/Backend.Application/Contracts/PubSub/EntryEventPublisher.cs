using Backend.Domain.Entities;

namespace Backend.Application.Contracts.PubSub;

public interface IEntryEventPublisher
{
    Task PublishCreatedAsync(Entry entry, CancellationToken cancellationToken);
    Task PublishUpdatedAsync(Entry entry, CancellationToken cancellationToken);
    Task PublishDeletedAsync(Guid entryId, Guid userId, CancellationToken cancellationToken);
}