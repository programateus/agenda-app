using Backend.Domain.Entities;

namespace Backend.Application.Contracts.Realtime;

public interface IChatMessageNotifier
{
    Task NotifyMessageCreatedAsync(ChatMessage message, CancellationToken cancellationToken);
}
