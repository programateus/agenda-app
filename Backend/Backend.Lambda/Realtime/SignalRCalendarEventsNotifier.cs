using Backend.Application.Contracts.Realtime;
using Backend.Lambda.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Lambda.Realtime;

public sealed class SignalRCalendarEventsNotifier : ICalendarEventsNotifier
{
    private readonly IHubContext<ChatHub> _hubContext;

    public SignalRCalendarEventsNotifier(IHubContext<ChatHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task NotifyEntriesChangedAsync(Guid userId, CancellationToken cancellationToken)
    {
        return _hubContext.Clients
            .Group(ChatHub.GetUserGroupName(userId))
            .SendAsync(
                "CalendarEntriesChanged",
                new
                {
                    userId,
                    changedAt = DateTime.UtcNow
                },
                cancellationToken
            );
    }
}

