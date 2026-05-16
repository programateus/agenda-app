using Backend.Domain.Entities;

namespace Backend.Application.UseCases.Chats.CreateChat;

public sealed record CreateChatResult(
    Guid ChatId,
    ChatStatus Status,
    DateTime LastMessageAt,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
