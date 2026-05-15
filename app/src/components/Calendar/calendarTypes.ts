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

export type EntryUpdateScope = "Single" | "Forward" | "All";

export interface CalendarEntryUpdateDraft extends CalendarEntryDraft {
  originalStartDate: string;
  scope: EntryUpdateScope;
}

export interface CalendarProps {
  events?: EventInput[];
  initialView?: CalendarView;
  initialDate?: DateInput;
  onEntryDraftCreate?: (entry: CalendarEntryDraft) => Promise<void> | void;
  onEntryDraftUpdate?: (
    entry: CalendarEntryUpdateDraft,
  ) => Promise<void> | void;
  onVisibleRangeChange?: (range: {
    startDate: Date;
    endDate: Date;
    view: DatesSetInfo["view"]["type"];
  }) => void;
}

export interface CalendarEditorState {
  mode: "create" | "edit";
  entryId: string;
  originalStartDate?: string;
  isRecurring?: boolean;
  left: number;
  top: number;
  width: number;
  maxHeight: number;
}

export interface EntryFormData {
  title: string;
  startDate: string;
  endDate: string;
  until: string;
  frequency: EntryFrequency;
}
