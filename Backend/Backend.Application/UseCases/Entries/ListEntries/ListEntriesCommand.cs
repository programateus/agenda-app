using Backend.Application.Common.Errors;
using CSharpFunctionalExtensions;
using MediatR;

namespace Backend.Application.UseCases.Entries.ListEntries;

public sealed record ListEntriesCommand(
    Guid UserId,
    DateTime StartDate,
    DateTime EndDate
): IRequest<Result<ListEntriesResult, ApiError>>;