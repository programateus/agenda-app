import { useMemo, useState } from "react";
import type { EventInput } from "@fullcalendar/react";

import { Calendar } from "@/components/Calendar/Calendar";
import type {
  CalendarEntryDeleteDraft,
  CalendarEntryDraft,
  CalendarEntryUpdateDraft,
} from "@/components/Calendar/calendarTypes";
import { useCreateEntryMutation } from "@/hooks/reactQuery/entries/useCreateEntryMutation";
import { useDeleteEntryMutation } from "@/hooks/reactQuery/entries/useDeleteEntryMutation";
import { useListEntriesQuery } from "@/hooks/reactQuery/entries/useListEntriesQuery";
import { useUpdateEntryMutation } from "@/hooks/reactQuery/entries/useUpdateEntryMutation";
import { parse } from "date-fns";

const createInitialDateRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return { startDate, endDate };
};

export const DashboardPage = () => {
  const [visibleRange, setVisibleRange] = useState(createInitialDateRange);
  const { mutateAsync: createEntry } = useCreateEntryMutation();
  const { mutateAsync: updateEntry } = useUpdateEntryMutation();
  const { mutateAsync: deleteEntry } = useDeleteEntryMutation();
  const { data } = useListEntriesQuery(visibleRange);

  const events = useMemo<EventInput[]>(
    () =>
      (data?.data.entries ?? []).flatMap((entry) =>
        entry.entryOccurrences.map((occurrence) => ({
          id: occurrence.id,
          title: occurrence.title,
          start: parse(
            occurrence.startDate,
            "yyyy-MM-dd'T'HH:mm:ss",
            new Date(),
          ),
          end: parse(occurrence.endDate, "yyyy-MM-dd'T'HH:mm:ss", new Date()),
          extendedProps: {
            entryId: entry.id,
            frequency: entry.frequency,
            until: entry.until
              ? parse(entry.until, "yyyy-MM-dd'T'HH:mm:ss", new Date())
              : null,
            originalStartDate: occurrence.originalStartDate,
            isCanceled: occurrence.isCanceled,
          },
        })),
      ),
    [data],
  );

  const handleCreate = async (entry: CalendarEntryDraft) => {
    await createEntry({
      title: entry.title,
      startDate: entry.startDate,
      endDate: entry.endDate,
      until: entry.until,
      frequency: entry.frequency,
    });
  };

  const handleUpdate = async (entry: CalendarEntryUpdateDraft) => {
    await updateEntry({
      id: entry.id,
      title: entry.title,
      startDate: entry.startDate,
      endDate: entry.endDate,
      until: entry.until,
      frequency: entry.frequency,
      scope: entry.scope,
      originalStartDate: entry.originalStartDate,
    });
  };

  const handleDelete = async (entry: CalendarEntryDeleteDraft) => {
    await deleteEntry({
      id: entry.id,
      originalStartDate: entry.originalStartDate,
      scope: entry.scope,
    });
  };

  return (
    <div className="h-full">
      <Calendar
        events={events}
        onEntryDraftCreate={handleCreate}
        onEntryDraftUpdate={handleUpdate}
        onEntryDraftDelete={handleDelete}
        onVisibleRangeChange={({ startDate, endDate }) => {
          setVisibleRange((currentRange) => {
            if (
              currentRange.startDate.getTime() === startDate.getTime() &&
              currentRange.endDate.getTime() === endDate.getTime()
            ) {
              return currentRange;
            }

            return { startDate, endDate };
          });
        }}
      />
    </div>
  );
};
