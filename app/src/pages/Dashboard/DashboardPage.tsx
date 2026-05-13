import { useMemo, useState } from "react";
import type { EventInput } from "@fullcalendar/react";

import { Calendar } from "@/components/Calendar/Calendar";
import type { CalendarEntryDraft } from "@/components/Calendar/calendarTypes";
import { useCreateEntryMutation } from "@/hooks/reactQuery/entries/useCreateEntryMutation";
import { useListEntriesQuery } from "@/hooks/reactQuery/entries/useListEntriesQuery";

const createInitialDateRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return { startDate, endDate };
};

export const DashboardPage = () => {
  const [visibleRange, setVisibleRange] = useState(createInitialDateRange);
  const { mutateAsync: createEntry } = useCreateEntryMutation();
  const { data } = useListEntriesQuery(visibleRange);

  const events = useMemo<EventInput[]>(
    () =>
      (data?.data.entries ?? []).flatMap((entry) =>
        entry.entryOccurrences.map((occurrence) => ({
          id: occurrence.id,
          title: occurrence.title,
          start: occurrence.startDate,
          end: occurrence.endDate,
          extendedProps: {
            entryId: entry.id,
            frequency: entry.frequency,
            originalStartDate: occurrence.originalStartDate,
            isCanceled: occurrence.isCanceled,
          },
        })),
      ),
    [data],
  );

  const handleSubmit = async (entry: CalendarEntryDraft) => {
    await createEntry({
      title: entry.title,
      startDate: entry.startDate,
      endDate: entry.endDate,
      frequency: entry.frequency,
    });
  };

  return (
    <div className="h-full">
      <Calendar
        events={events}
        onEntryDraftSubmit={handleSubmit}
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
