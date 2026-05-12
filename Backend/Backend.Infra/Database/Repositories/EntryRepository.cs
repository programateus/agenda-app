using Backend.Domain.Entities;
using Backend.Domain.Repositories;

namespace Backend.Infra.Database.Repositories;

public sealed class EntryRepository : IEntryRepository
{
    private readonly AppDbContext _dbContext;
    
    public EntryRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public Task<Entry?> FindByIdAsync(Guid entryId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public async Task CreateAsync(Entry entry, CancellationToken cancellationToken = default)
    {
        await _dbContext.Entries.AddAsync(entry, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task UpdateAsync(Entry entry, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(Entry entry, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<List<Entry>> GetAllInIntervalAsync(Guid userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}