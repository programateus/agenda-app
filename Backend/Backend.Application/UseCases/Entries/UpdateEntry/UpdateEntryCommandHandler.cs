using Backend.Application.Common.Errors;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Entries.UpdateEntry;

public class UpdateEntryCommandHandler : IRequestHandler<UpdateEntryCommand, Result<UpdateEntryResult, ApiError>>
{
    private readonly IEntryRepository _entryRepository;

    public UpdateEntryCommandHandler(IEntryRepository entryRepository)
    {
        _entryRepository = entryRepository;
    }
    
    public async Task<Result<UpdateEntryResult, ApiError>> Handle(UpdateEntryCommand request,
        CancellationToken cancellationToken)
    {
        var entry = await _entryRepository.FindByIdAsync(request.Id, cancellationToken);
        if (entry is null)
        {
            return Result.Failure<UpdateEntryResult, ApiError>(new NotFoundError("Entry not found"));
        }

        if (request.Scope == UpdateScope.Single)
        {
            
        }

        return Result.Success<UpdateEntryResult, ApiError>(new UpdateEntryResult());
    }
}