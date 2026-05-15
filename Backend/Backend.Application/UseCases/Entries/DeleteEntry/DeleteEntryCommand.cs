using Backend.Application.Common.Errors;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Entries.DeleteEntry;

public enum DeleteScope
{
    Single,
    All
}

public sealed record DeleteEntryCommand(
    Guid EntryId,
    Guid UserId,
    DateTime OriginalStartDate,
    DeleteScope Scope
    
): IRequest<Result<DeleteEntryResult, ApiError>>;