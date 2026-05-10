using Backend.Application.Common.Errors;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Auth.SignIn;

public sealed record SignInCommand(string Email, string Password): IRequest<Result<SignInResult, ApiError>>;