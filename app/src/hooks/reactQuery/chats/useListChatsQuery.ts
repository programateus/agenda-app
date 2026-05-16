import { useQuery } from "@tanstack/react-query";

import { chatQueryKeys } from "@/hooks/reactQuery/queryKeys";
import { listChats, type ListChatsResponse } from "@/services/chats";

export const useListChatsQuery = () => {
  return useQuery<ListChatsResponse>({
    queryKey: chatQueryKeys.list,
    queryFn: listChats,
  });
};
