using Backend.Domain.Entities;
using Backend.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infra.Database.Repositories;

public sealed class ChatRepository : IChatRepository
{
    private readonly AppDbContext _dbContext;

    public ChatRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Chat?> FindByIdAsync(Guid chatId, CancellationToken cancellationToken = default)
    {
        return _dbContext.Chats.FirstOrDefaultAsync(chat => chat.Id == chatId, cancellationToken);
    }

    public Task<List<Chat>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return _dbContext.Chats
            .Where(chat => chat.UserId == userId)
            .OrderByDescending(chat => chat.LastMessageAt)
            .ToListAsync(cancellationToken);
    }

    public async Task CreateAsync(Chat chat, CancellationToken cancellationToken = default)
    {
        await _dbContext.Chats.AddAsync(chat, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Chat chat, CancellationToken cancellationToken = default)
    {
        _dbContext.Chats.Update(chat);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Chat chat, CancellationToken cancellationToken = default)
    {
        _dbContext.Chats.Remove(chat);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
