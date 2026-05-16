using Backend.Application.Contracts.Realtime;
using Backend.Domain.Entities;
using Backend.Lambda.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Lambda.Realtime;

public sealed class SignalRChatMessageNotifier : IChatMessageNotifier
{
    private readonly IHubContext<ChatHub> _hubContext;

    public SignalRChatMessageNotifier(IHubContext<ChatHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task NotifyMessageCreatedAsync(ChatMessage message, CancellationToken cancellationToken)
    {
        return _hubContext.Clients
            .Group(ChatHub.GetGroupName(message.ChatId))
            .SendAsync(
                "ChatMessageCreated",
                new
                {
                    message.Id,
                    message.ChatId,
                    message.SenderRole,
                    message.Content,
                    message.Status,
                    message.TraceId,
                    message.ErrorMessage,
                    message.CreatedAt,
                    message.UpdatedAt
                },
                cancellationToken
            );
    }
}
