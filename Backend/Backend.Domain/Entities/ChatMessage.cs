using System.Text.Json.Serialization;

namespace Backend.Domain.Entities;

public enum SenderRole
{
    User,
    Assistant,
    System
}

public enum ChatMessageStatus
{
    Pending,
    Completed,
    Failed
}

public class ChatMessage
{
    public Guid Id { get; private set; }

    [JsonIgnore]
    public Chat Chat { get; private set; } = null!;
    public Guid ChatId { get; private set; }
    public SenderRole SenderRole { get; private set; }
    public string Content { get; private set; }
    public ChatMessageStatus Status { get; private set; }
    public Guid TraceId { get; private set; }
    public string ErrorMessage { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private ChatMessage()
    {
        Content = string.Empty;
        ErrorMessage = string.Empty;
    }

    public ChatMessage(
        Guid chatId,
        SenderRole senderRole,
        string content,
        ChatMessageStatus status,
        Guid traceId,
        string errorMessage
    )
    {
        Id = Guid.NewGuid();
        ChatId = chatId;
        SenderRole = senderRole;
        Content = content;
        Status = status;
        TraceId = traceId;
        ErrorMessage = errorMessage;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
