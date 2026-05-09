using Backend.Application.Common.Errors;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.SignUp;

public sealed record SignUpCommand(
    string Name,
    string Email,
    string Password
) : IRequest<Result<SignUpResult, ApiError>>;