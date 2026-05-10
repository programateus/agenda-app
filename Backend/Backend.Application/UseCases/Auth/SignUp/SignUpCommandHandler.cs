using Backend.Application.Common.Errors;
using Backend.Application.Contracts.Security;
using Backend.Domain.Entities;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Auth.SignUp;

public class SignUpCommandHandler : IRequestHandler<SignUpCommand, Result<SignUpResult, ApiError>>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public SignUpCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }
    
    public async Task<Result<SignUpResult, ApiError>> Handle(SignUpCommand request, CancellationToken cancellationToken)
    {
        var foundUser = await _userRepository.FindByEmailAsync(request.Email, cancellationToken);
        if (foundUser != null)
        {
            return Result.Failure<SignUpResult, ApiError>(new ConflictError(message: "Email already exists"));
        }
        
        var hashedPassword =  _passwordHasher.Hash(request.Password);
        var user = new User(request.Name, request.Email, hashedPassword);
        await  _userRepository.CreateAsync(user, cancellationToken);

        return Result.Success<SignUpResult, ApiError>(new SignUpResult());
    }
}