using Backend.Domain.Entities;

namespace Backend.Domain.Repositories;

public interface IEntryRepository
{
    public Task<Entry?> FindByIdAsync(Guid entryId, CancellationToken cancellationToken = default);
    public Task CreateAsync(Entry entry, CancellationToken cancellationToken = default); 
    public Task UpdateAsync(Entry entry, CancellationToken cancellationToken = default);
    public Task DeleteAsync(Entry entry, CancellationToken cancellationToken = default);
    public Task<List<Entry>> GetAllInIntervalAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}