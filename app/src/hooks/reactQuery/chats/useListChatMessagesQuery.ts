import { useQuery } from "@tanstack/react-query";

import { chatQueryKeys } from "@/hooks/reactQuery/queryKeys";
import {
  listChatMessages,
  type ListChatMessagesResponse,
} from "@/services/chats";

export const useListChatMessagesQuery = (chatId: string | null) => {
  return useQuery<ListChatMessagesResponse>({
    queryKey: chatId ? chatQueryKeys.messages(chatId) : [...chatQueryKeys.all, "idle"],
    queryFn: () => listChatMessages(chatId!),
    enabled: Boolean(chatId),
  });
};
