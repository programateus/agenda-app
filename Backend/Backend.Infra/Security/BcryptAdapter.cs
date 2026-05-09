using Backend.Application.Contracts.Security;

namespace Backend.Infra.Security;

public class BcryptAdapter : IPasswordHasher
{
    public string Hash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool Verify(string password, string hashedPassword)
    {
        return  BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }
}