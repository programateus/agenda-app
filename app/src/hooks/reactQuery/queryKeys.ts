import { createQueryKeys, mergeQueryKeys } from "@lukemorales/query-key-factory";

type EntriesListParams = {
  startDate: Date;
  endDate: Date;
};

const entriesQueryKeys = createQueryKeys("entries", {
  list: ({ startDate, endDate }: EntriesListParams) => ({
    queryKey: [
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    ],
  }),
});

export const queryKeys = mergeQueryKeys(entriesQueryKeys);

export const chatQueryKeys = {
  all: ["chats"] as const,
  list: ["chats", "list"] as const,
  messages: (chatId: string) => ["chats", "messages", chatId] as const,
};
