using Backend.Application.Common.Errors;
using Backend.Application.Contracts.EntryGenerator;
using Backend.Domain.Entities;
using Backend.Domain.Repositories;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Entries.ListEntries;

public class ListEntriesCommandHandler : IRequestHandler<ListEntriesCommand, Result<ListEntriesResult, ApiError>>
{
    private readonly IEntryRepository _entryRepository;
    private readonly IEntryOccurrenceGenerator  _entryOccurrenceGenerator;

    public ListEntriesCommandHandler(IEntryRepository entryRepository, IEntryOccurrenceGenerator entryOccurrenceGenerator)
    {
        _entryRepository = entryRepository;
        _entryOccurrenceGenerator = entryOccurrenceGenerator;
    }
    
    public async Task<Result<ListEntriesResult, ApiError>> Handle(ListEntriesCommand request,
        CancellationToken cancellationToken)
    {
        var entries = await _entryRepository.GetAllInIntervalAsync(request.UserId, request.StartDate, request.EndDate,
            cancellationToken);
        entries.ForEach(entry => _entryOccurrenceGenerator.Generate(entry, request.StartDate, request.EndDate));
        return Result.Success<ListEntriesResult, ApiError>(new ListEntriesResult(entries));
    }
}