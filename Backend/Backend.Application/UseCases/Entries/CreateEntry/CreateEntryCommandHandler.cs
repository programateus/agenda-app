using Backend.Application.Common.Errors;
using Backend.Application.Contracts.PubSub;
using Backend.Domain.Entities;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Entries.CreateEntry;

public class CreateEntryCommandHandler  : IRequestHandler<CreateEntryCommand, Result<CreateEntryResult, ApiError>>
{
    private readonly IUserRepository _userRepository;
    private readonly IEntryRepository _entryRepository;
    private readonly IEntryEventPublisher _entryEventPublisher;

    public CreateEntryCommandHandler(
        IUserRepository userRepository,
        IEntryRepository entryRepository,
        IEntryEventPublisher entryEventPublisher)
    {
        _userRepository = userRepository;
        _entryRepository = entryRepository;
        _entryEventPublisher = entryEventPublisher;
    }

    public async Task<Result<CreateEntryResult, ApiError>> Handle(CreateEntryCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.FindByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return Result.Failure<CreateEntryResult, ApiError>(new NotFoundError("User not found"));
        }
        
        var entry = new Entry(
            request.Title,
            request.StartDate,
            request.EndDate,
            request.Until,
            request.Frequency,
            request.UserId
        );
        await _entryRepository.CreateAsync(entry, cancellationToken);
        await _entryEventPublisher.PublishCreatedAsync(entry, cancellationToken);

        return Result.Success<CreateEntryResult, ApiError>(new CreateEntryResult());
    }
}