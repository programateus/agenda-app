import { api, type ApiResponse } from "@/lib/api";
import type { EntryFrequency } from "@/components/Calendar/calendarTypes";

export type CreateEntryRequest = {
  title: string;
  startDate: string;
  endDate: string;
  until: string | null;
  frequency: EntryFrequency;
};

export type CreateEntryResponse = ApiResponse<Record<string, never>>;

export const createEntry = async (payload: CreateEntryRequest) => {
  const { data } = await api.post<CreateEntryResponse>("/api/entries", payload);

  return data;
};

export type ListEntriesRequest = {
  startDate: Date;
  endDate: Date;
};

export type Entry = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  until: string | null;
  frequency: EntryFrequency;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  entryOccurrences: {
    id: string;
    title: string;
    startDate: string;
    originalStartDate: string;
    endDate: string;
    isCanceled: false;
    entryId: string;
    createdAt: string;
    updatedAt: string;
  }[];
};

export type ListEntriesData = {
  entries: Entry[];
};

type RawListEntriesResponse = ApiResponse<{
  entries?: Entry[];
}>;

export type ListEntriesResponse = ApiResponse<ListEntriesData>;

export const listEntries = async (payload: ListEntriesRequest) => {
  const queryParams = new URLSearchParams();
  queryParams.append("startDate", payload.startDate.toISOString());
  queryParams.append("endDate", payload.endDate.toISOString());
  const { data } = await api.get<RawListEntriesResponse>(
    `/api/entries?${queryParams.toString()}`,
  );

  return {
    ...data,
    data: {
      entries: data.data.entries ?? [],
    },
  } satisfies ListEntriesResponse;
};
