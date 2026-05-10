import type { DateInput, EventInput } from "@fullcalendar/react";

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
  frequency: EntryFrequency;
}

export interface CalendarProps {
  events?: EventInput[];
  initialView?: CalendarView;
  initialDate?: DateInput;
  onEntryDraftSubmit?: (entry: CalendarEntryDraft) => void;
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
  frequency: EntryFrequency;
}
