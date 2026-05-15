using System.Text.Json.Serialization;

namespace Backend.Domain.Entities;

public class EntryOccurrence
{
    public Guid Id { get; private set; }
    public string Title { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime OriginalStartDate { get; set; }
    public DateTime EndDate { get; private set; }
    public bool IsCanceled { get; set; }

    [JsonIgnore]
    public Entry Entry { get; private set; }
    public Guid EntryId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    
    private EntryOccurrence() {}

    public EntryOccurrence(string title, DateTime startDate, DateTime originalStartDate, DateTime endDate, bool isCanceled, Guid entryId)
    {
        Id = Guid.NewGuid();
        Title = title;
        StartDate = startDate;
        OriginalStartDate = originalStartDate;
        EndDate = endDate;
        IsCanceled = isCanceled;
        EntryId = entryId;
        CreatedAt = DateTime.Now;
        UpdatedAt = DateTime.Now;
    }
    
    public void Update(string title, DateTime startDate, DateTime endDate)
    {
        Title = title;
        StartDate = startDate;
        EndDate = endDate;
        // TODO: fix UpdatedAt to update automatically
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        IsCanceled = true;
    }
}