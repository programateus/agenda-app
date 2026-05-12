using Backend.Application.Contracts.EntryGenerator;
using Backend.Domain.Entities;
using Ical.Net;
using Ical.Net.CalendarComponents;
using Ical.Net.DataTypes;

namespace Backend.Infra.EntryGenerator;

public class EntryOccurrenceGenerator : IEntryOccurrenceGenerator
{
    public Entry Generate(Entry entry, DateTime rangeStartDate, DateTime rangeEndDate)
    {
        var calendarEvent = new CalendarEvent()
        {
            DtStart = new CalDateTime(entry.StartDate),
            DtEnd = new CalDateTime(entry.EndDate),
            RecurrenceRule = new RecurrencePattern(FrequencyType.Daily)
            {
                Interval = 1,
                Count = 5
            }
            
        };
        var rangeStart = new CalDateTime(rangeStartDate);
        var rangeEnd = new CalDateTime(rangeEndDate);

        var occurrences = calendarEvent
            .GetOccurrences(rangeStart)
            .TakeWhileBefore(rangeEnd)
            .ToList();

        foreach (var occurrence in occurrences)
        {
            Console.WriteLine(occurrence.Period.StartTime);
        }

        return entry;
    }
}