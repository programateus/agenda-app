using Backend.Domain.Entities;
using Backend.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infra.Database.Repositories;

public sealed class ChatMessageRepository : IChatMessageRepository
{
    private readonly AppDbContext _dbContext;

    public ChatMessageRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<ChatMessage?> FindByIdAsync(Guid messageId, CancellationToken cancellationToken = default)
    {
        return _dbContext.ChatMessages.FirstOrDefaultAsync(message => message.Id == messageId, cancellationToken);
    }

    public Task<List<ChatMessage>> GetByChatIdAsync(Guid chatId, CancellationToken cancellationToken = default)
    {
        return _dbContext.ChatMessages
            .Where(message => message.ChatId == chatId)
            .OrderBy(message => message.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task CreateAsync(ChatMessage message, CancellationToken cancellationToken = default)
    {
        await _dbContext.ChatMessages.AddAsync(message, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(ChatMessage message, CancellationToken cancellationToken = default)
    {
        _dbContext.ChatMessages.Update(message);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(ChatMessage message, CancellationToken cancellationToken = default)
    {
        _dbContext.ChatMessages.Remove(message);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
