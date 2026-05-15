using Backend.Domain.Entities;

namespace Backend.Domain.Repositories;

public interface IEntryOccurrenceRepository
{
    public Task<EntryOccurrence?> FindAsync(
        Guid entryId,
        DateTime originalStartDate,
        CancellationToken cancellationToken = default);
    public Task CreateAsync(EntryOccurrence occurrence, CancellationToken cancellationToken = default);
    public Task UpdateAsync(EntryOccurrence occurrence, CancellationToken cancellationToken = default);
}