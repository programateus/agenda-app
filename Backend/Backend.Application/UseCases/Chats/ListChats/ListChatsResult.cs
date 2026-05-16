using Backend.Domain.Entities;

namespace Backend.Application.UseCases.Chats.ListChats;

public sealed record ListChatsResult(List<Chat> Chats);
