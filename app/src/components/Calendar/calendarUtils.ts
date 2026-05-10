import type {
  DateClickInfo,
  DateInput,
  DateSelectInfo,
  EventInput,
} from "@fullcalendar/react";

import type {
  CalendarEditorState,
  CalendarEntryDraft,
  CalendarView,
  EntryFormData,
  EntryFrequency,
} from "./calendarTypes";

export const frequencyOptions: EntryFrequency[] = [
  "None",
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
  "Custom",
];

export const viewOptions: Array<{ label: string; value: CalendarView }> = [
  { label: "Month", value: "dayGridMonth" },
  { label: "Week", value: "timeGridWeek" },
  { label: "Day", value: "timeGridDay" },
];

export const tooltipWidth = 360;

const tooltipHeight = 430;
const hourInMs = 60 * 60 * 1000;

export const createEntryId = () => crypto.randomUUID();

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const pad = (value: number) => String(value).padStart(2, "0");

export const toDateTimeLocalValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;

const setTime = (date: Date, hours: number, minutes = 0) => {
  const nextDate = new Date(date);
  nextDate.setHours(hours, minutes, 0, 0);
  return nextDate;
};

const addHours = (date: Date, hours: number) =>
  new Date(date.getTime() + hours * hourInMs);

const toDate = (value: DateInput | null | undefined) => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    const [year, month = 0, day = 1, hours = 0, minutes = 0, seconds = 0] =
      value;
    return new Date(year, month, day, hours, minutes, seconds, 0);
  }

  if (value instanceof Date) {
    return new Date(value);
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 9, 0, 0, 0);
  }

  return new Date(value);
};

export const createFormValuesFromDates = (
  startDate: Date,
  endDate?: Date,
): EntryFormData => {
  const safeEndDate =
    endDate && endDate >= startDate ? endDate : addHours(startDate, 1);

  return {
    title: "",
    startDate: toDateTimeLocalValue(startDate),
    endDate: toDateTimeLocalValue(safeEndDate),
    frequency: "None",
  };
};

export const createFormValuesFromDateClick = (info: DateClickInfo) => {
  const startDate = info.allDay
    ? setTime(new Date(info.date), 9)
    : new Date(info.date);
  const endDate = info.allDay
    ? setTime(new Date(info.date), 10)
    : addHours(startDate, 1);

  return createFormValuesFromDates(startDate, endDate);
};

export const createFormValuesFromSelection = (info: DateSelectInfo) => {
  if (info.allDay) {
    const startDate = setTime(new Date(info.start), 9);
    const inclusiveEndDate = new Date(info.end);
    inclusiveEndDate.setDate(inclusiveEndDate.getDate() - 1);
    const endDate =
      inclusiveEndDate >= info.start
        ? setTime(inclusiveEndDate, 10)
        : addHours(startDate, 1);

    return createFormValuesFromDates(startDate, endDate);
  }

  return createFormValuesFromDates(new Date(info.start), new Date(info.end));
};

export const createDraftFromEventInput = (
  event: EventInput,
  fallbackId: string,
): CalendarEntryDraft => {
  const startDate = toDate(event.start) ?? new Date();
  const endDate = toDate(event.end) ?? addHours(startDate, 1);
  const frequency = frequencyOptions.includes(
    event.extendedProps?.frequency as EntryFrequency,
  )
    ? (event.extendedProps?.frequency as EntryFrequency)
    : "None";

  return {
    id: String(event.id ?? fallbackId),
    title: event.title ?? "",
    startDate: toDateTimeLocalValue(startDate),
    endDate: toDateTimeLocalValue(endDate),
    frequency,
  };
};

export const createEventInputFromDraft = (
  entry: CalendarEntryDraft,
): EventInput => ({
  id: entry.id,
  title: entry.title,
  start: new Date(entry.startDate).toISOString(),
  end: new Date(entry.endDate).toISOString(),
  extendedProps: {
    frequency: entry.frequency,
    isDraft: true,
  },
});

export const calculateEditorPosition = (
  container: HTMLDivElement,
  clientX: number,
  clientY: number,
): Omit<CalendarEditorState, "mode" | "entryId"> => {
  const bounds = container.getBoundingClientRect();
  const maxLeft = Math.max(0, bounds.width - tooltipWidth);
  const maxTop = Math.max(0, bounds.height - tooltipHeight);

  return {
    left: clamp(clientX - bounds.left, 0, maxLeft),
    top: clamp(clientY - bounds.top, 0, maxTop),
  };
};

export const mergeDraftEntries = (
  sourceEvents: EventInput[],
  draftEntries: Record<string, CalendarEntryDraft>,
) => {
  const mergedDraftEntries: CalendarEntryDraft[] = [];
  const incomingIds = new Set<string>();

  sourceEvents.forEach((event, index) => {
    const fallbackId = `incoming-${index}`;
    const resolvedId = String(event.id ?? fallbackId);
    incomingIds.add(resolvedId);
    mergedDraftEntries.push(
      draftEntries[resolvedId] ?? createDraftFromEventInput(event, fallbackId),
    );
  });

  Object.values(draftEntries).forEach((draftEntry) => {
    if (!incomingIds.has(draftEntry.id)) {
      mergedDraftEntries.push(draftEntry);
    }
  });

  return mergedDraftEntries;
};
