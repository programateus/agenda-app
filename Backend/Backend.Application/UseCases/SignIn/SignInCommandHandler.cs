using System.Reflection.Metadata;
using Backend.Application.Common.Errors;
using Backend.Application.Contracts.Auth;
using Backend.Application.Contracts.Security;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.SignIn;

public class SignInCommandHandler : IRequestHandler<SignInCommand, Result<SignInResult,ApiError>>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public SignInCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }
    
    public async Task<Result<SignInResult, ApiError>> Handle(SignInCommand command, CancellationToken cancellationToken)
    {
        var user = await _userRepository.FindByEmailAsync(command.Email, cancellationToken);
        if (user is null)
        {
            return Result.Failure<SignInResult, ApiError>(new UnauthorizedError("Invalid credentials"));
        }

        var isValid = _passwordHasher.Verify(command.Password, user.Password);
        if (!isValid)
        {
            return Result.Failure<SignInResult, ApiError>(new UnauthorizedError("Invalid credentials"));
        }
        var token = _jwtTokenGenerator.Generate(new UserTokenPayload(user.Id));
        return Result.Success<SignInResult, ApiError>(new SignInResult(token));
    }
}