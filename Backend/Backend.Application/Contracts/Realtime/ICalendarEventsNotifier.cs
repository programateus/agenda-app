namespace Backend.Application.Contracts.Realtime;

public interface ICalendarEventsNotifier
{
    Task NotifyEntriesChangedAsync(Guid userId, CancellationToken cancellationToken);
}

