using Backend.Domain.Entities;

namespace Backend.Application.UseCases.Chats.ListChatMessages;

public sealed record ListChatMessagesResult(List<ChatMessage> Messages);
