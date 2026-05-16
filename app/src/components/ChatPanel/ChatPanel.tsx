import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Alert,
  Button,
  Chip,
  ScrollShadow,
  Spinner,
  Surface,
  TextArea,
  toast,
} from "@heroui/react";
import { format, isValid, parseISO } from "date-fns";

import { useAuth } from "@/hooks/useAuth";
import { useCreateChatMessageMutation } from "@/hooks/reactQuery/chats/useCreateChatMessageMutation";
import { useCreateChatMutation } from "@/hooks/reactQuery/chats/useCreateChatMutation";
import { useListChatMessagesQuery } from "@/hooks/reactQuery/chats/useListChatMessagesQuery";
import { useListChatsQuery } from "@/hooks/reactQuery/chats/useListChatsQuery";
import type { ChatMessage } from "@/services/chats";

import { useChatConnection } from "./useChatConnection";

const formatChatTimestamp = (value: string) => {
  const date = parseISO(value);

  if (!isValid(date)) {
    return "No activity";
  }

  return format(date, "dd/MM HH:mm");
};

const formatMessageTimestamp = (value: string) => {
  const date = parseISO(value);

  if (!isValid(date)) {
    return "";
  }

  return format(date, "HH:mm");
};

const getChatTitle = (index: number) => {
  return `Chat ${index + 1}`;
};

const getSenderLabel = (message: ChatMessage, userName?: string | null) => {
  if (message.senderRole === "User") {
    return userName || "You";
  }

  if (message.senderRole === "Assistant") {
    return "Assistant";
  }

  return "System";
};

export const ChatPanel = () => {
  const { user, accessToken } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    data: chatsResponse,
    isLoading: isLoadingChats,
    isError: isChatsError,
  } = useListChatsQuery();
  const chats = useMemo(
    () => chatsResponse?.data.chats ?? [],
    [chatsResponse?.data.chats],
  );

  const {
    data: messagesResponse,
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
    isError: isMessagesError,
  } = useListChatMessagesQuery(selectedChatId);
  const messages = messagesResponse?.data.messages ?? [];

  const { mutateAsync: createChat, isPending: isCreatingChat } =
    useCreateChatMutation();
  const { mutateAsync: createChatMessage, isPending: isSendingMessage } =
    useCreateChatMessageMutation();
  const connection = useChatConnection({
    accessToken,
    selectedChatId,
  });

  useEffect(() => {
    if (!chats.length) {
      setSelectedChatId(null);
      return;
    }

    const selectedChatStillExists = chats.some(
      (chat) => chat.id === selectedChatId,
    );

    if (!selectedChatStillExists) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length, selectedChatId]);

  const activeChat = useMemo(() => {
    return chats.find((chat) => chat.id === selectedChatId) ?? null;
  }, [chats, selectedChatId]);

  const activeChatIndex = useMemo(() => {
    return chats.findIndex((chat) => chat.id === selectedChatId);
  }, [chats, selectedChatId]);

  const activeChatTitle =
    activeChat && activeChatIndex >= 0
      ? getChatTitle(activeChatIndex)
      : "Select a chat";
  const liveUpdatesLabel = {
    idle: "Live updates unavailable",
    connecting: "Connecting live updates...",
    connected: "Live updates connected",
    reconnecting: "Reconnecting live updates...",
    error: "Live updates unavailable",
  }[connection.status];

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleCreateChat = async () => {
    try {
      const response = await createChat();
      setSelectedChatId(response.data.chatId);
      toast.success("New chat created.");
    } catch {
      toast.danger("Could not create the chat.");
    }
  };

  const handleSendMessage = async () => {
    const content = draftMessage.trim();

    if (!selectedChatId || !content) {
      return;
    }

    try {
      await createChatMessage({
        chatId: selectedChatId,
        content,
      });
      setDraftMessage("");
    } catch {
      toast.danger("Could not send the message.");
    }
  };

  const handleComposerKeyDown = async (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    await handleSendMessage();
  };

  return (
    <Surface className="flex h-full min-h-[24rem] min-w-0 flex-col rounded-lg border border-default-200 bg-white/90 p-3 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3 border-b border-default-200 px-2 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-default-500">
            Chat
          </p>
          <h2 className="mt-1 text-lg font-semibold text-default-900">
            Schedule conversation
          </h2>
          <p className="mt-1 text-sm text-default-600">
            Create a chat, follow the conversation history, and send messages to
            the backend.
          </p>
        </div>

        <Button isDisabled={isCreatingChat} onPress={handleCreateChat}>
          {isCreatingChat ? "Creating..." : "New chat"}
        </Button>
      </div>

      {(isChatsError || isMessagesError) && (
        <Alert className="mt-3" status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Could not load the chat.</Alert.Title>
          </Alert.Content>
        </Alert>
      )}

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3">
        <Surface className="flex min-h-[8.5rem] flex-col rounded-lg border border-default-200 bg-default-50/80 p-2">
          <div className="flex items-center justify-between px-2 pb-2">
            <div>
              <p className="text-sm font-semibold text-default-800">Chats</p>
              <p className="text-xs text-default-500">
                {isLoadingChats
                  ? "Loading..."
                  : `${chats.length} conversations`}
              </p>
            </div>
            {isLoadingChats && <Spinner size="sm" />}
          </div>

          <ScrollShadow
            className="min-h-0 flex-1 pb-1"
            orientation="horizontal"
          >
            <div
              className="flex gap-2 px-2 py-4"
              role="tablist"
              aria-label="Chat list"
            >
              {chats.map((chat, index) => {
                const isActive = chat.id === selectedChatId;

                return (
                  <button
                    key={chat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`chat-panel-${chat.id}`}
                    onClick={() => handleSelectChat(chat.id)}
                    className={[
                      "w-56 shrink-0 rounded-lg border px-3 py-3 text-left transition sm:w-64",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20"
                        : "border-default-200 bg-white hover:border-default-300 hover:bg-default-100/80",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={[
                          "text-sm font-semibold",
                          isActive
                            ? "text-primary-foreground"
                            : "text-default-900",
                        ].join(" ")}
                      >
                        {getChatTitle(index)}
                      </span>
                      <Chip
                        className={[
                          "border-none",
                          isActive
                            ? "bg-white/20 text-primary-foreground"
                            : "bg-default-100 text-default-700",
                        ].join(" ")}
                      >
                        {isActive ? "Active" : chat.status}
                      </Chip>
                    </div>
                    <p
                      className={[
                        "mt-2 text-xs",
                        isActive
                          ? "text-primary-foreground/80"
                          : "text-default-500",
                      ].join(" ")}
                    >
                      Last activity
                    </p>
                    <p
                      className={[
                        "text-sm",
                        isActive
                          ? "text-primary-foreground"
                          : "text-default-700",
                      ].join(" ")}
                    >
                      {formatChatTimestamp(chat.lastMessageAt)}
                    </p>
                  </button>
                );
              })}

              {!isLoadingChats && !chats.length && (
                <div className="flex min-h-24 w-full min-w-56 items-center justify-center rounded-lg border border-dashed border-default-300 bg-white/70 px-4 py-6 text-center text-sm text-default-500">
                  No chats yet.
                </div>
              )}
            </div>
          </ScrollShadow>
        </Surface>

        <Surface
          id={selectedChatId ? `chat-panel-${selectedChatId}` : undefined}
          className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-default-200 bg-white p-3"
        >
          <div className="border-b border-default-200 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-default-900">
                  {activeChatTitle}
                </p>
                <p className="text-xs text-default-500">
                  {activeChat
                    ? `Active conversation with ${user?.name ?? "you"} - Updated at ${formatChatTimestamp(activeChat.updatedAt)}`
                    : "Create a new chat to get started"}
                </p>
                <p className="mt-1 text-xs text-default-400">
                  {liveUpdatesLabel}
                </p>
              </div>
              {isFetchingMessages && selectedChatId && <Spinner size="sm" />}
            </div>
          </div>

          {!selectedChatId ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-default-500">
              Choose a chat above or create a new one to start chatting.
            </div>
          ) : (
            <>
              <ScrollShadow className="mt-3 min-h-0 min-w-0 flex-1 overflow-y-auto pr-2">
                <div className="space-y-3">
                  {isLoadingMessages ? (
                    <div className="flex h-full min-h-48 items-center justify-center">
                      <div className="flex items-center gap-3 text-sm text-default-500">
                        <Spinner />
                        <span>Loading messages...</span>
                      </div>
                    </div>
                  ) : messages.length ? (
                    messages.map((message) => {
                      const isCurrentUser = message.senderRole === "User";

                      return (
                        <div
                          key={message.id}
                          className={[
                            "flex",
                            isCurrentUser ? "justify-end" : "justify-start",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "max-w-[85%] rounded-lg px-4 py-3 shadow-sm",
                              isCurrentUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-default-100 text-default-900",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                                {getSenderLabel(message, user?.name)}
                              </span>
                              <span className="text-xs opacity-70">
                                {formatMessageTimestamp(message.createdAt)}
                              </span>
                            </div>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                              {message.content}
                            </p>

                            {message.status !== "Completed" && (
                              <p className="mt-2 text-xs opacity-75">
                                Status: {message.status}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-default-300 bg-default-50/60 px-6 text-center text-sm text-default-500">
                      This chat does not have any messages yet.
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollShadow>

              <div className="mt-3 min-w-0 border-t border-default-200 pt-3">
                <TextArea
                  className="w-full min-w-0 resize-none"
                  rows={3}
                  placeholder="Write your message. Enter sends it, Shift + Enter adds a new line."
                  value={draftMessage}
                  onChange={(event) => setDraftMessage(event.target.value)}
                  onKeyDown={(event) => handleComposerKeyDown(event)}
                />

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    className="sm:shrink-0 ml-auto"
                    isDisabled={
                      isSendingMessage ||
                      !selectedChatId ||
                      !draftMessage.trim().length
                    }
                    onPress={() => void handleSendMessage()}
                  >
                    {isSendingMessage ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Surface>
      </div>
    </Surface>
  );
};
