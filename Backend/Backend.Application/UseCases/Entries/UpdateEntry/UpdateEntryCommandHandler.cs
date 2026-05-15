using Backend.Application.Common.Errors;
using Backend.Domain.Entities;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Entries.UpdateEntry;

public class UpdateEntryCommandHandler : IRequestHandler<UpdateEntryCommand, Result<UpdateEntryResult, ApiError>>
{
    private readonly IEntryRepository _entryRepository;
    private readonly IEntryOccurrenceRepository _entryOccurrenceRepository;

    public UpdateEntryCommandHandler(IEntryRepository entryRepository, IEntryOccurrenceRepository entryOccurrenceRepository)
    {
        _entryRepository = entryRepository;
        _entryOccurrenceRepository = entryOccurrenceRepository;
    }
    
    public async Task<Result<UpdateEntryResult, ApiError>> Handle(UpdateEntryCommand request,
        CancellationToken cancellationToken)
    {
        var entry = await _entryRepository.FindByIdAsync(request.Id, cancellationToken);
        if (entry is null || entry.OwnerId != request.UserId)
        {
            return Result.Failure<UpdateEntryResult, ApiError>(new NotFoundError("Entry not found"));
        }

        if (request.Scope == UpdateScope.Single)
        {
            await UpdateSingle(request, entry, cancellationToken);
            return Result.Success<UpdateEntryResult, ApiError>(new UpdateEntryResult());
        }

        if (request.Scope == UpdateScope.Forward)
        {
            await UpdateForward(request, entry, cancellationToken);
            return Result.Success<UpdateEntryResult, ApiError>(new UpdateEntryResult());
        }
        
        await UpdateAll(request, entry, cancellationToken);
        return Result.Success<UpdateEntryResult, ApiError>(new UpdateEntryResult());
    }

    private async Task UpdateSingle(
        UpdateEntryCommand request,
        Entry entry,
        CancellationToken cancellationToken)
    {
        var occurrence = await _entryOccurrenceRepository.FindAsync(
            request.Id,
            request.OriginalStartDate,
            cancellationToken
        );

        if (occurrence is null)
        {
            occurrence = new EntryOccurrence(
                request.Title,
                request.StartDate,
                request.OriginalStartDate,
                request.EndDate,
                false,
                entry.Id
            );

            await _entryOccurrenceRepository.CreateAsync(occurrence, cancellationToken);
            return;
        }
        
        occurrence.Update(
            request.Title,
            request.StartDate,
            request.EndDate
        );
        await _entryOccurrenceRepository.UpdateAsync(occurrence, cancellationToken);
    }

    private async Task UpdateForward(
        UpdateEntryCommand request,
        Entry entry,
        CancellationToken cancellationToken)
    {
        entry.EndRecurrence(request.OriginalStartDate.AddDays(-1));
        var nextEntry = new Entry(
            request.Title,
            request.StartDate,
            request.EndDate,
            request.Until,
            request.Frequency,
            request.UserId
        );
        await Task.WhenAll([
            _entryRepository.UpdateAsync(entry, cancellationToken),
            _entryRepository.CreateAsync(nextEntry, cancellationToken)
        ]);
    }

    private async Task UpdateAll(
        UpdateEntryCommand request,
        Entry entry,
        CancellationToken cancellationToken)
    {
        entry.Update(
            request.Title,
            request.StartDate,
            request.EndDate,
            request.Until,
            request.Frequency
        );
        await _entryRepository.UpdateAsync(entry, cancellationToken);
    }
}