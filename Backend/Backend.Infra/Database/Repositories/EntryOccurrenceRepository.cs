using Backend.Domain.Entities;
using Backend.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infra.Database.Repositories;

public class EntryOccurrenceRepository : IEntryOccurrenceRepository
{
    private readonly AppDbContext _dbContext;
    
    public EntryOccurrenceRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public async Task<EntryOccurrence?> FindAsync(Guid entryId, DateTime originalStartDate, CancellationToken cancellationToken = default)
    {
        return await _dbContext.EntryOccurrences.FirstOrDefaultAsync(x =>
                    x.EntryId == entryId &&
                    x.OriginalStartDate == originalStartDate,
                cancellationToken);
    }

    public async Task CreateAsync(EntryOccurrence occurrence, CancellationToken cancellationToken = default)
    {
        await _dbContext.EntryOccurrences.AddAsync(occurrence, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(EntryOccurrence occurrence, CancellationToken cancellationToken = default)
    {
        _dbContext.EntryOccurrences.Update(occurrence);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}