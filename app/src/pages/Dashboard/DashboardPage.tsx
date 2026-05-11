import { Calendar } from "@/components/Calendar/Calendar";
import type { CalendarEntryDraft } from "@/components/Calendar/calendarTypes";
import { useCreateEntryMutation } from "@/hooks/reactQuery/entries/useCreateEntryMutation";

export const DashboardPage = () => {
  const { mutateAsync: createEntry } = useCreateEntryMutation();

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
      <Calendar onEntryDraftSubmit={handleSubmit} />
    </div>
  );
};
