using Backend.Application.Common.Errors;
using Backend.Application.Contracts.PubSub;
using Backend.Domain.Entities;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Entries.DeleteEntry;

public class DeleteEntryCommandHandler : IRequestHandler<DeleteEntryCommand, Result<DeleteEntryResult, ApiError>>
{
    private readonly IEntryRepository _entryRepository;
    private readonly IEntryOccurrenceRepository _entryOccurrenceRepository;
    private readonly IEntryEventPublisher _entryEventPublisher;
    private readonly IEntryOccurrenceEventPublisher _entryOccurrenceEventPublisher;
    
    public DeleteEntryCommandHandler(
        IEntryRepository entryRepository,
        IEntryOccurrenceRepository entryOccurrenceRepository,
        IEntryEventPublisher entryEventPublisher,
        IEntryOccurrenceEventPublisher entryOccurrenceEventPublisher)
    {
        _entryRepository = entryRepository;
        _entryOccurrenceRepository = entryOccurrenceRepository;
        _entryEventPublisher = entryEventPublisher;
        _entryOccurrenceEventPublisher = entryOccurrenceEventPublisher;
    }
    
    public async Task<Result<DeleteEntryResult, ApiError>> Handle(DeleteEntryCommand request,
        CancellationToken cancellationToken)
    {
        var entry = await _entryRepository.FindByIdAsync(request.EntryId, cancellationToken);
        if (entry is null || entry.OwnerId != request.UserId)
        {
            return Result.Failure<DeleteEntryResult, ApiError>(new NotFoundError("Entry not found"));
        }

        if (request.Scope == DeleteScope.Single)
        {
            await DeleteSingleEntry(request, entry, cancellationToken);
            return Result.Success<DeleteEntryResult, ApiError>(new DeleteEntryResult());
        }
        
        await DeleteAllEntries(entry, request.UserId, cancellationToken);
        return Result.Success<DeleteEntryResult, ApiError>(new DeleteEntryResult());
    }

    private async Task DeleteSingleEntry(DeleteEntryCommand request, Entry entry, CancellationToken cancellationToken)
    {
        var occurrence = await _entryOccurrenceRepository.FindAsync(request.EntryId, request.OriginalStartDate, cancellationToken);
        var difference = entry.EndDate - entry.StartDate;

        if (occurrence is null)
        {
            occurrence = new EntryOccurrence(
                entry.Title,
                request.OriginalStartDate,
                request.OriginalStartDate,
                request.OriginalStartDate.Add(difference),
                true,
                entry.Id
            );

            await _entryOccurrenceRepository.CreateAsync(occurrence, cancellationToken);
            await _entryOccurrenceEventPublisher.PublishUpsertedAsync(occurrence, cancellationToken);
            return;
        }

        occurrence.Cancel();
        await _entryOccurrenceRepository.UpdateAsync(occurrence, cancellationToken);
        await _entryOccurrenceEventPublisher.PublishUpsertedAsync(occurrence, cancellationToken);
    }

    private async Task DeleteAllEntries(Entry entry, Guid userId, CancellationToken cancellationToken)
    {
        await _entryRepository.DeleteAsync(entry, cancellationToken);
        await _entryEventPublisher.PublishDeletedAsync(entry.Id, userId, cancellationToken);
    }
}
