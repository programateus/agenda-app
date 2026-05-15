using Backend.Application.Common.Errors;
using Backend.Domain.Entities;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Entries.CreateEntry;

public record CreateEntryCommand(
    string Title,
    DateTime StartDate,
    DateTime EndDate,
    DateTime? Until,
    Frequency Frequency,
    Guid UserId
): IRequest<Result<CreateEntryResult, ApiError>>;
