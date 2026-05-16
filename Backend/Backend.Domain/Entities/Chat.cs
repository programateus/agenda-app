using System.Text.Json.Serialization;

namespace Backend.Domain.Entities;

public enum ChatStatus
{
    Active,
    Closed,
    Archived,
}

public class Chat
{
    public Guid Id { get; private set; }

    [JsonIgnore]
    public User User { get; private set; } = null!;
    public Guid UserId { get; private set; }
    public ChatStatus Status { get; private set; }
    public DateTime LastMessageAt { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public ICollection<ChatMessage> Messages { get; private set; } = [];

    private Chat() { }

    public Chat(Guid userId, ChatStatus status, DateTime lastMessageAt)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Status = status;
        LastMessageAt = lastMessageAt;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RegisterMessage(DateTime createdAt)
    {
        LastMessageAt = createdAt;
        UpdatedAt = DateTime.UtcNow;
    }
}
