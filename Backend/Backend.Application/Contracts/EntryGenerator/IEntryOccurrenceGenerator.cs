using Backend.Domain.Entities;

namespace Backend.Application.Contracts.EntryGenerator;

public interface IEntryOccurrenceGenerator
{
    public Entry Generate(Entry entry, DateTime rangeStartDate, DateTime rangeEndDate);
}