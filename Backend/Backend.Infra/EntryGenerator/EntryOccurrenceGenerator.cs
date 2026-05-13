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
        var frequency = MapEntryFrequencyToRRuleFrequency(entry.Frequency);
        if (frequency is null)
        {
            return entry;
        }
        
        var calendarEvent = new CalendarEvent
        {
            Start = new CalDateTime(entry.StartDate),
            End = new CalDateTime(entry.EndDate),
            RecurrenceRule = new RecurrencePattern(frequency.Value)
        };
        var rangeStart = new CalDateTime(rangeStartDate);
        var rangeEnd = new CalDateTime(rangeEndDate);

        var occurrences = calendarEvent
            .GetOccurrences(rangeStart)
            .TakeWhileBefore(rangeEnd.AddDays(1))
            .ToList();

        foreach (var occurrence in occurrences)
        {
            var entryOccurrence = GenerateVirtualEntryOccurrence(entry, occurrence);
            if (entryOccurrence is null) continue;
            entry.EntryOccurrences.Add(entryOccurrence);
        }
        
        var canceledOccurrences = entry.EntryOccurrences
            .Where(entryOccurrence => entryOccurrence.IsCanceled)
            .ToList();

        foreach (var occurrence in canceledOccurrences)
        {
            entry.EntryOccurrences.Remove(occurrence);
        }

        return entry;
    }

    private FrequencyType? MapEntryFrequencyToRRuleFrequency(Frequency frequency)
    {
        return frequency switch
        {
            Frequency.Daily => FrequencyType.Daily,
            Frequency.Weekly => FrequencyType.Weekly,
            Frequency.Monthly => FrequencyType.Monthly,
            Frequency.Yearly => FrequencyType.Yearly,
            _ => null
        };
    }

    private EntryOccurrence? GenerateVirtualEntryOccurrence(Entry entry, Occurrence occurrence)
    {
        var startDate = occurrence.Period.StartTime.AsUtc;
        var endDate = occurrence.Period.EffectiveEndTime?.AsUtc ?? startDate;
        var existingEntryOccurrence =
            entry.EntryOccurrences.FirstOrDefault(entryOccurrence => entryOccurrence.OriginalStartDate == startDate);
        if (existingEntryOccurrence is not null)
        {
            return null;
        }
        
        return new EntryOccurrence(
            entry.Title,
            startDate,
            startDate,
            endDate,
            false,
            entry.Id
        );
    }
}