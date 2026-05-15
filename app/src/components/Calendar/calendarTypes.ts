import type { DateInput, DatesSetInfo, EventInput } from "@fullcalendar/react";

export type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay";
export type EntryFrequency =
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Yearly"
  | "Custom"
  | "None";

export interface CalendarEntryDraft {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  until: string | null;
  frequency: EntryFrequency;
}

export interface CalendarProps {
  events?: EventInput[];
  initialView?: CalendarView;
  initialDate?: DateInput;
  onEntryDraftSubmit?: (entry: CalendarEntryDraft) => Promise<void> | void;
  onVisibleRangeChange?: (range: {
    startDate: Date;
    endDate: Date;
    view: DatesSetInfo["view"]["type"];
  }) => void;
}

export interface CalendarEditorState {
  mode: "create" | "edit";
  entryId: string;
  left: number;
  top: number;
}

export interface EntryFormData {
  title: string;
  startDate: string;
  endDate: string;
  until: string;
  frequency: EntryFrequency;
}
