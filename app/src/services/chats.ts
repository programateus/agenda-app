import { api, type ApiResponse } from "@/lib/api";

export type ChatStatus = "Active" | "Closed" | "Archived";
export type SenderRole = "User" | "Assistant" | "System";
export type ChatMessageStatus = "Pending" | "Completed" | "Failed";

export type Chat = {
  id: string;
  userId: string;
  status: ChatStatus;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderRole: SenderRole;
  content: string;
  status: ChatMessageStatus;
  traceId: string;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
};

type RawListChatsResponse = ApiResponse<{
  chats?: Chat[];
}>;

export type ListChatsResponse = ApiResponse<{
  chats: Chat[];
}>;

export const listChats = async () => {
  const { data } = await api.get<RawListChatsResponse>("/api/chats");

  return {
    ...data,
    data: {
      chats: data.data.chats ?? [],
    },
  } satisfies ListChatsResponse;
};

export type CreateChatResponse = ApiResponse<{
  chatId: string;
  status: ChatStatus;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}>;

export const createChat = async () => {
  const { data } = await api.post<CreateChatResponse>("/api/chats");

  return data;
};

type RawListChatMessagesResponse = ApiResponse<{
  messages?: ChatMessage[];
}>;

export type ListChatMessagesResponse = ApiResponse<{
  messages: ChatMessage[];
}>;

export const listChatMessages = async (chatId: string) => {
  const { data } = await api.get<RawListChatMessagesResponse>(
    `/api/chats/${chatId}/messages`,
  );

  return {
    ...data,
    data: {
      messages: data.data.messages ?? [],
    },
  } satisfies ListChatMessagesResponse;
};

export type CreateChatMessageRequest = {
  chatId: string;
  content: string;
};

export type CreateChatMessageResponse = ApiResponse<{
  messageId: string;
  chatId: string;
  traceId: string;
  status: ChatMessageStatus;
  createdAt: string;
}>;

export const createChatMessage = async ({
  chatId,
  content,
}: CreateChatMessageRequest) => {
  const { data } = await api.post<CreateChatMessageResponse>(
    `/api/chats/${chatId}/messages`,
    { content },
  );

  return data;
};
