using Backend.Domain.Entities;

namespace Backend.Domain.Repositories;

public interface IChatRepository
{
    public Task<Chat?> FindByIdAsync(Guid chatId, CancellationToken cancellationToken = default);
    public Task<List<Chat>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    public Task CreateAsync(Chat chat, CancellationToken cancellationToken = default);
    public Task UpdateAsync(Chat chat, CancellationToken cancellationToken = default);
    public Task DeleteAsync(Chat chat, CancellationToken cancellationToken = default);
}
