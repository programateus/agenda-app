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
            AddSingleOccurrence(entry);
            return entry;
        }

        var calendarEvent = CreateCalendarEvent(entry, frequency.Value);

        var occurrences = GetOccurrencesInRange(
            calendarEvent,
            rangeStartDate,
            rangeEndDate
        );

        AddVirtualOccurrences(entry, occurrences);
        RemoveCanceledOccurrences(entry);

        return entry;
    }

    private void AddSingleOccurrence(Entry entry)
    {
        if (HasOccurrence(entry, entry.StartDate))
        {
            return;
        }

        entry.EntryOccurrences.Add(CreateEntryOccurrence(
            entry,
            originalStartDate: entry.StartDate,
            startDate: entry.StartDate,
            endDate: entry.EndDate
        ));
    }

    private CalendarEvent CreateCalendarEvent(Entry entry, FrequencyType frequency)
    {
        return new CalendarEvent
        {
            Start = new CalDateTime(entry.StartDate),
            End = new CalDateTime(entry.EndDate),
            RecurrenceRule = CreateRecurrencePattern(entry, frequency)
        };
    }

    private RecurrencePattern CreateRecurrencePattern(Entry entry, FrequencyType frequency)
    {
        var recurrencePattern = new RecurrencePattern(frequency);

        if (entry.Until is not null)
        {
            recurrencePattern.Until = new CalDateTime(
                DateTime.SpecifyKind(entry.Until.Value, DateTimeKind.Utc)
            );
        }

        return recurrencePattern;
    }

    private List<Occurrence> GetOccurrencesInRange(
        CalendarEvent calendarEvent,
        DateTime rangeStartDate,
        DateTime rangeEndDate)
    {
        var rangeStart = new CalDateTime(rangeStartDate);
        var rangeEnd = new CalDateTime(rangeEndDate);

        return calendarEvent
            .GetOccurrences(rangeStart)
            .TakeWhileBefore(rangeEnd.AddDays(1))
            .ToList();
    }

    private void AddVirtualOccurrences(Entry entry, IEnumerable<Occurrence> occurrences)
    {
        foreach (var occurrence in occurrences)
        {
            var startDate = occurrence.Period.StartTime.Value;

            if (HasOccurrence(entry, startDate))
            {
                continue;
            }

            var endDate = occurrence.Period.EffectiveEndTime?.Value ?? startDate;

            entry.EntryOccurrences.Add(CreateEntryOccurrence(
                entry,
                originalStartDate: startDate,
                startDate: startDate,
                endDate: endDate
            ));
        }
    }

    private void RemoveCanceledOccurrences(Entry entry)
    {
        var canceledOccurrences = entry.EntryOccurrences
            .Where(entryOccurrence => entryOccurrence.IsCanceled)
            .ToList();

        foreach (var canceledOccurrence in canceledOccurrences)
        {
            entry.EntryOccurrences.Remove(canceledOccurrence);
        }
    }

    private bool HasOccurrence(Entry entry, DateTime originalStartDate)
    {
        return entry.EntryOccurrences.Any(entryOccurrence =>
            entryOccurrence.OriginalStartDate == originalStartDate);
    }

    private EntryOccurrence CreateEntryOccurrence(
        Entry entry,
        DateTime originalStartDate,
        DateTime startDate,
        DateTime endDate)
    {
        return new EntryOccurrence(
            entry.Title,
            startDate,
            originalStartDate,
            endDate,
            false,
            entry.Id
        );
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
}
