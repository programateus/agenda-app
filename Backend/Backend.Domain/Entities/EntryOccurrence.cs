namespace Backend.Domain.Entities;

public class EntryOccurrence
{
    public Guid Id { get; private set; }
    public string Title { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime OriginalStartDate { get; set; }
    public DateTime EndDate { get; private set; }
    public bool IsCanceled { get; set; }
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
}