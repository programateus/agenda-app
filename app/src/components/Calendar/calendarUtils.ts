import type {
  DateClickInfo,
  DateSelectInfo,
  EventInput,
} from "@fullcalendar/react";
import { addDays, addHours, format, set } from "date-fns";

import type {
  CalendarEditorState,
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

export const createEntryId = () => crypto.randomUUID();

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const createFormValuesFromDates = (
  startDate: Date,
  endDate?: Date,
): EntryFormData => {
  const safeEndDate =
    endDate && endDate >= startDate ? endDate : addHours(startDate, 1);

  return {
    title: "",
    startDate: format(startDate, "yyyy-MM-dd'T'HH:mm"),
    endDate: format(safeEndDate, "yyyy-MM-dd'T'HH:mm"),
    frequency: "None",
  };
};

export const createFormValuesFromDateClick = (info: DateClickInfo) => {
  const startDate = info.allDay
    ? set(new Date(info.date), {
        hours: 9,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      })
    : new Date(info.date);
  const endDate = info.allDay
    ? set(new Date(info.date), {
        hours: 10,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      })
    : addHours(startDate, 1);

  return createFormValuesFromDates(startDate, endDate);
};

export const createFormValuesFromSelection = (info: DateSelectInfo) => {
  if (info.allDay) {
    const startDate = set(new Date(info.start), {
      hours: 9,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    const inclusiveEndDate = addDays(new Date(info.end), -1);
    const endDate =
      inclusiveEndDate >= info.start
        ? set(inclusiveEndDate, {
            hours: 10,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
          })
        : addHours(startDate, 1);

    return createFormValuesFromDates(startDate, endDate);
  }

  return createFormValuesFromDates(new Date(info.start), new Date(info.end));
};

export const createFormValuesFromEvent = (
  calendarEvent: EventInput,
  fallbackId: string,
) => {
  const startDate = calendarEvent.start
    ? new Date(calendarEvent.start.toString())
    : new Date();
  const endDate = calendarEvent.end
    ? new Date(calendarEvent.end.toString())
    : addHours(startDate, 1);
  const frequency = frequencyOptions.includes(
    calendarEvent.extendedProps?.frequency as EntryFrequency,
  )
    ? (calendarEvent.extendedProps?.frequency as EntryFrequency)
    : "None";

  return {
    id: String(calendarEvent.id ?? fallbackId),
    title: calendarEvent.title ?? "",
    startDate: format(startDate, "yyyy-MM-dd'T'HH:mm"),
    endDate: format(endDate, "yyyy-MM-dd'T'HH:mm"),
    frequency,
  };
};

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
