import { useMutation, useQueryClient } from "@tanstack/react-query";

import { chatQueryKeys } from "@/hooks/reactQuery/queryKeys";
import { createChat } from "@/services/chats";

export const useCreateChatMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChat,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatQueryKeys.list,
      });
    },
  });
};
