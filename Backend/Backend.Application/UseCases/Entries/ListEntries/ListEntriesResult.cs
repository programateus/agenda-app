using Backend.Domain.Entities;

namespace Backend.Application.UseCases.Entries.ListEntries;

public sealed record ListEntriesResult(
    List<Entry> Entries
);