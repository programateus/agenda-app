namespace Backend.Application.Contracts.Auth;

public interface IJwtTokenGenerator
{
    string Generate(UserTokenPayload payload);
}