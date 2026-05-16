import { useMemo, useState } from "react";
import type { EventInput } from "@fullcalendar/react";

import { Calendar } from "@/components/Calendar/Calendar";
import { ChatPanel } from "@/components/ChatPanel";
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

  const handleVisibleRangeChange = ({
    startDate,
    endDate,
  }: {
    startDate: Date;
    endDate: Date;
    view: string;
  }) => {
    setVisibleRange((currentRange) => {
      if (
        currentRange.startDate.getTime() === startDate.getTime() &&
        currentRange.endDate.getTime() === endDate.getTime()
      ) {
        return currentRange;
      }

      return { startDate, endDate };
    });
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.10),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] p-4 2xl:overflow-hidden">
      <div className="grid min-h-full gap-4 2xl:h-full 2xl:min-h-0 2xl:grid-cols-[minmax(0,1fr)_34rem] 2xl:overflow-hidden">
        <div className="min-h-[32rem] min-w-0 overflow-hidden rounded-lg border border-white/70 shadow-sm 2xl:min-h-0">
          <Calendar
            events={events}
            onEntryDraftCreate={handleCreate}
            onEntryDraftUpdate={handleUpdate}
            onEntryDraftDelete={handleDelete}
            onVisibleRangeChange={handleVisibleRangeChange}
          />
        </div>

        <div className="min-h-[24rem] min-w-0 2xl:min-h-0 2xl:overflow-hidden">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};
