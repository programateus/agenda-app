import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/reactQuery/queryKeys";
import { createEntry } from "@/services/entries";

export const useCreateEntryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEntry,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.entries.list._def,
      });
    },
  });
};
