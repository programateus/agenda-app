using Backend.Domain.Repositories;
using Backend.Lambda.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Lambda.Hubs;

[Authorize]
public sealed class ChatHub : Hub
{
    private readonly IChatRepository _chatRepository;

    public ChatHub(IChatRepository chatRepository)
    {
        _chatRepository = chatRepository;
    }

    public async Task JoinChat(string chatId)
    {
        var userId = Context.User?.GetUserId();
        if (userId is null)
        {
            throw new HubException("Unauthorized");
        }

        if (!Guid.TryParse(chatId, out var parsedChatId))
        {
            throw new HubException("Invalid chat");
        }

        var chat = await _chatRepository.FindByIdAsync(parsedChatId, Context.ConnectionAborted);
        if (chat is null || chat.UserId != userId.Value)
        {
            throw new HubException("Chat not found");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(parsedChatId), Context.ConnectionAborted);
    }

    public Task LeaveChat(string chatId)
    {
        if (!Guid.TryParse(chatId, out var parsedChatId))
        {
            return Task.CompletedTask;
        }

        return Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGroupName(parsedChatId), Context.ConnectionAborted);
    }

    public static string GetGroupName(Guid chatId) => $"chat:{chatId}";
}
