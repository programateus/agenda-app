using Backend.Domain.Entities;

namespace Backend.Lambda.DTOs;

public sealed record CreateEntryDTO(string Title, DateTime StartDate, DateTime EndDate, Frequency Frequency);