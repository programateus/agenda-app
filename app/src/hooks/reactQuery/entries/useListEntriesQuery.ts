import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/reactQuery/queryKeys";
import {
  listEntries,
  type ListEntriesRequest,
  type ListEntriesResponse,
} from "@/services/entries";

export const useListEntriesQuery = (params: ListEntriesRequest) => {
  return useQuery<ListEntriesResponse>({
    queryKey: queryKeys.entries.list(params).queryKey,
    queryFn: () => listEntries(params),
  });
};
