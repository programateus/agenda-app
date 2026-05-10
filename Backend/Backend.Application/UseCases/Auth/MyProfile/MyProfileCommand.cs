using Backend.Application.Common.Errors;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Auth.MyProfile;

public sealed record MyProfileCommand(Guid UserId) : IRequest<Result<MyProfileResult, ApiError>>;