import { api, type ApiResponse } from "@/lib/api";
import type { EntryFrequency } from "@/components/Calendar/calendarTypes";

export type CreateEntryRequest = {
  title: string;
  startDate: string;
  endDate: string;
  frequency: EntryFrequency;
};

export type CreateEntryResponse = ApiResponse<Record<string, never>>;

export const createEntry = async (payload: CreateEntryRequest) => {
  const { data } = await api.post<CreateEntryResponse>("/api/entries", payload);

  return data;
};
