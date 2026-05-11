namespace Backend.Domain.Entities;

public enum Frequency {
    Daily,
    Weekly,
    Monthly,
    Yearly,
    Custom,
    None
}

public class Entry
{
    public Guid Id { get; private set; }
    public string Title { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public Frequency  Frequency { get; private set; }
    public User Owner { get; private set; } = null!;
    public Guid OwnerId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    
    public ICollection<EntryOccurrence> EntryOccurrences { get; private set; } = [];
    
    private Entry() {}

    public Entry(string title, DateTime startDate, DateTime endDate, Frequency frequency, Guid ownerId)
    {
        Id = Guid.NewGuid();
        Title = title;
        StartDate = startDate;
        EndDate = endDate;
        Frequency = frequency;
        OwnerId = ownerId;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}