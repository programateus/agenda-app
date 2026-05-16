using Backend.Domain.Entities;

namespace Backend.Domain.Repositories;

public interface IChatMessageRepository
{
    public Task<ChatMessage?> FindByIdAsync(Guid messageId, CancellationToken cancellationToken = default);
    public Task<List<ChatMessage>> GetByChatIdAsync(Guid chatId, CancellationToken cancellationToken = default);
    public Task CreateAsync(ChatMessage message, CancellationToken cancellationToken = default);
    public Task UpdateAsync(ChatMessage message, CancellationToken cancellationToken = default);
    public Task DeleteAsync(ChatMessage message, CancellationToken cancellationToken = default);
}
