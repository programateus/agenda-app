import { useEffect, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { chatQueryKeys } from "@/hooks/reactQuery/queryKeys";
import type { ListChatMessagesResponse } from "@/services/chats";

import { chatConnectionStore } from "./chatConnectionStore";

type UseChatConnectionParams = {
  accessToken?: string | null;
  selectedChatId: string | null;
};

const getChatHubUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();

  if (!apiUrl) {
    return null;
  }

  return `${apiUrl.replace(/\/$/, "")}/hubs/chat`;
};

export const useChatConnection = ({
  accessToken,
  selectedChatId,
}: UseChatConnectionParams) => {
  const queryClient = useQueryClient();
  const snapshot = useSyncExternalStore(
    chatConnectionStore.subscribe,
    chatConnectionStore.getSnapshot,
    chatConnectionStore.getServerSnapshot,
  );

  useEffect(() => {
    const unsubscribe = chatConnectionStore.subscribeToMessages((message) => {
      queryClient.setQueryData<ListChatMessagesResponse | undefined>(
        chatQueryKeys.messages(message.chatId),
        (current) => {
          const existingMessages = current?.data.messages ?? [];

          if (existingMessages.some((item) => item.id === message.id)) {
            return current;
          }

          return {
            code: current?.code ?? 200,
            message: current?.message ?? "Success",
            data: {
              messages: [...existingMessages, message],
            },
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.list,
      });
    });

    return unsubscribe;
  }, [queryClient]);

  useEffect(() => {
    void chatConnectionStore.configure({
      accessToken: accessToken ?? null,
      hubUrl: getChatHubUrl(),
    });
  }, [accessToken]);

  useEffect(() => {
    chatConnectionStore.setSelectedChat(selectedChatId);
  }, [selectedChatId]);

  useEffect(() => {
    return () => {
      void chatConnectionStore.dispose();
    };
  }, []);

  return snapshot;
};
