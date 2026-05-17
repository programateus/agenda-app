namespace Backend.Lambda.ScheduleCommands;

public sealed record ScheduleCommandMessage(
    string Operation,
    Guid ChatId,
    Guid UserId,
    Guid TraceId,
    string SuccessMessage,
    string? Title,
    DateTime? StartDate,
    DateTime? EndDate,
    DateTime? Until,
    string? Frequency,
    Guid? EntryId,
    DateTime? OriginalStartDate,
    string? Scope
);

