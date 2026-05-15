using Backend.Application.Common.Errors;
using Backend.Domain.Entities;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Entries.UpdateEntry;

public enum UpdateScope
{
    Single,
    Forward,
    All
}

public sealed record UpdateEntryCommand(
    Guid Id,
    string Title,
    DateTime StartDate,
    DateTime EndDate,
    DateTime? Until,
    Frequency Frequency,
    Guid UserId,
    UpdateScope Scope
): IRequest<Result<UpdateEntryResult, ApiError>>;