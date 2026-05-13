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
