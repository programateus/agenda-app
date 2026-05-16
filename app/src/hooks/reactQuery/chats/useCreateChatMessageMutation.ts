import { useMutation, useQueryClient } from "@tanstack/react-query";

import { chatQueryKeys } from "@/hooks/reactQuery/queryKeys";
import { createChatMessage } from "@/services/chats";

export const useCreateChatMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChatMessage,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: chatQueryKeys.list,
        }),
        queryClient.invalidateQueries({
          queryKey: chatQueryKeys.messages(variables.chatId),
        }),
      ]);
    },
  });
};
