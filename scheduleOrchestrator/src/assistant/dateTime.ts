import {
  addDays as addDaysFn,
  addHours as addHoursFn,
  addMinutes as addMinutesFn,
  addMonths as addMonthsFn,
  addYears as addYearsFn,
  endOfDay as endOfDayFn,
  format,
  isValid,
  parseISO,
  startOfDay as startOfDayFn,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EntryFrequency } from "./types";

const LOCAL_DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
const HUMAN_DATE_FORMAT = "EEEE, dd/MM/yyyy";
const HUMAN_TIME_FORMAT = "HH:mm";

export const parseLocalDateTime = (value: string): Date => {
  const date = parseISO(value);

  if (!isValid(date)) {
    throw new Error(`Invalid local datetime: ${value}`);
  }

  return date;
};

export const formatLocalDateTime = (value: Date): string => {
  return format(value, LOCAL_DATE_TIME_FORMAT);
};

export const addDays = (value: Date, amount: number): Date => {
  return addDaysFn(value, amount);
};

export const addMonths = (value: Date, amount: number): Date => {
  return addMonthsFn(value, amount);
};

export const addYears = (value: Date, amount: number): Date => {
  return addYearsFn(value, amount);
};

export const addFrequency = (
  value: Date,
  frequency: EntryFrequency,
): Date | null => {
  switch (frequency) {
    case "Daily":
      return addDays(value, 1);
    case "Weekly":
      return addDays(value, 7);
    case "Monthly":
      return addMonths(value, 1);
    case "Yearly":
      return addYears(value, 1);
    default:
      return null;
  }
};

export const startOfDay = (value: Date): Date => {
  return startOfDayFn(value);
};

export const endOfDay = (value: Date): Date => {
  return endOfDayFn(value);
};

export const addHours = (value: Date, amount: number): Date => {
  return addHoursFn(value, amount);
};

export const addMinutes = (value: Date, amount: number): Date => {
  return addMinutesFn(value, amount);
};

export const hasOverlap = (
  startDate: Date,
  endDate: Date,
  rangeStart: Date,
  rangeEnd: Date,
) => {
  return startDate < rangeEnd && endDate > rangeStart;
};

export const formatHumanDateTimeRange = (
  startDate: string,
  endDate: string,
): string => {
  const start = parseLocalDateTime(startDate);
  const end = parseLocalDateTime(endDate);

  return `${format(start, HUMAN_DATE_FORMAT, { locale: ptBR })} das ${format(start, HUMAN_TIME_FORMAT)} as ${format(end, HUMAN_TIME_FORMAT)}`;
};

export const formatHumanDateTime = (value: string): string => {
  const date = parseLocalDateTime(value);
  return `${format(date, HUMAN_DATE_FORMAT, { locale: ptBR })} as ${format(date, HUMAN_TIME_FORMAT)}`;
};

export const formatNowForPrompt = (value: Date): string => {
  return `${formatLocalDateTime(value)} (${format(value, HUMAN_DATE_FORMAT, { locale: ptBR })} ${format(value, HUMAN_TIME_FORMAT)})`;
};
