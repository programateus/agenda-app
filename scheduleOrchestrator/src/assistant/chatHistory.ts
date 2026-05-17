import type { ChatHistoryMessage } from "@prisma/client";
import { prisma } from "@src/infra/prisma";

export type ConversationMessageRole = "user" | "assistant" | "system";

export type ConversationMessage = {
  role: ConversationMessageRole;
  content: string;
};

const DEFAULT_HISTORY_LIMIT = 12;

const normalizeRole = (senderRole: string): ConversationMessageRole => {
  const normalized = senderRole.trim().toLowerCase();

  if (normalized === "assistant" || normalized === "system") {
    return normalized;
  }

  return "user";
};

const mapConversationMessage = (
  message: Pick<ChatHistoryMessage, "senderRole" | "content">,
): ConversationMessage => ({
  role: normalizeRole(message.senderRole),
  content: message.content,
});

const toDate = (value: string | Date): Date =>
  value instanceof Date ? value : new Date(value);

export const recordIncomingChatMessage = async (input: {
  messageId: string;
  chatId: string;
  userId: string;
  traceId: string;
  content: string;
  createdAt: string | Date;
}): Promise<void> => {
  const createdAt = toDate(input.createdAt);

  await prisma.chatHistoryMessage.upsert({
    where: {
      id: input.messageId,
    },
    update: {
      chatId: input.chatId,
      userId: input.userId,
      traceId: input.traceId,
      senderRole: "user",
      content: input.content,
      createdAt,
    },
    create: {
      id: input.messageId,
      chatId: input.chatId,
      userId: input.userId,
      traceId: input.traceId,
      senderRole: "user",
      content: input.content,
      createdAt,
    },
  });
};

export const recordAssistantChatMessage = async (input: {
  chatId: string;
  traceId: string;
  content: string;
  createdAt?: Date;
}): Promise<void> => {
  const messageId = `assistant:${input.traceId}`;
  const createdAt = input.createdAt ?? new Date();

  await prisma.chatHistoryMessage.upsert({
    where: {
      id: messageId,
    },
    update: {
      chatId: input.chatId,
      traceId: input.traceId,
      senderRole: "assistant",
      content: input.content,
    },
    create: {
      id: messageId,
      chatId: input.chatId,
      userId: null,
      traceId: input.traceId,
      senderRole: "assistant",
      content: input.content,
      createdAt,
    },
  });
};

export const getRecentConversationHistory = async (
  chatId: string,
  options?: {
    limit?: number;
    excludeMessageId?: string;
  },
): Promise<ConversationMessage[]> => {
  const messages = await prisma.chatHistoryMessage.findMany({
    where: {
      chatId,
      id: options?.excludeMessageId
        ? {
            not: options.excludeMessageId,
          }
        : undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: options?.limit ?? DEFAULT_HISTORY_LIMIT,
    select: {
      senderRole: true,
      content: true,
    },
  });

  return messages.reverse().map(mapConversationMessage);
};
