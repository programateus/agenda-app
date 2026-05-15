using Backend.Application.UseCases.Entries.UpdateEntry;
using Backend.Domain.Entities;

namespace Backend.Lambda.DTOs;

public sealed record UpdateEntryDTO(
    Guid Id,
    string Title,
    DateTime StartDate,
    DateTime EndDate,
    DateTime? Until,
    Frequency Frequency,
    UpdateScope Scope,
    DateTime OriginalStartDate
);