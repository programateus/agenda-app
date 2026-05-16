import { z } from "zod";

const rawChatMessageCreatedSchema = z.object({
  MessageId: z.uuid(),
  ChatId: z.uuid(),
  UserId: z.uuid(),
  TraceId: z.uuid(),
  Content: z.string(),
  CreatedAt: z.string(),
});

export const chatMessageCreatedSchema = rawChatMessageCreatedSchema.transform(
  (message) => ({
    messageId: message.MessageId,
    chatId: message.ChatId,
    userId: message.UserId,
    traceId: message.TraceId,
    content: message.Content,
    createdAt: message.CreatedAt,
  }),
);

export type ChatMessageCreated = z.infer<typeof chatMessageCreatedSchema>;
