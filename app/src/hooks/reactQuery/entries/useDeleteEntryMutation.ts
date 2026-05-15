import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/reactQuery/queryKeys";
import { deleteEntry } from "@/services/entries";

export const useDeleteEntryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEntry,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.entries.list._def,
      });
    },
  });
};
