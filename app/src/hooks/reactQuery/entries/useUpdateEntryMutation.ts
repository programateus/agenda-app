import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/reactQuery/queryKeys";
import { updateEntry } from "@/services/entries";

export const useUpdateEntryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEntry,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.entries.list._def,
      });
    },
  });
};
