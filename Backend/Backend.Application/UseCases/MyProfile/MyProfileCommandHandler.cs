using Backend.Application.Common.Errors;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.MyProfile;

public class MyProfileCommandHandler : IRequestHandler<MyProfileCommand, Result<MyProfileResult, ApiError>>
{
    private readonly IUserRepository _userRepository;
    
    public MyProfileCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }
    
    public async Task<Result<MyProfileResult, ApiError>> Handle(MyProfileCommand command,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.FindByIdAsync(command.UserId, cancellationToken);
        if (user is null)
        {
            return Result.Failure<MyProfileResult, ApiError>(new NotFoundError("User not found"));
        }

        return Result.Success<MyProfileResult, ApiError>(new MyProfileResult(user.Name, user.Email));
    }
}