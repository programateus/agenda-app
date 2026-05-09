using Backend.Domain.Entities;

namespace Backend.Domain.Repositories;

public interface IUserRepository
{
    public Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken = default);
    public Task CreateAsync(User user, CancellationToken cancellationToken = default);
}