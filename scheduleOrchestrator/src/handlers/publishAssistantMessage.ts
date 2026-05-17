import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { recordAssistantChatMessage } from "@src/assistant/chatHistory";
import { env } from "@src/config/env";
import { eventBridge } from "@src/infra/eventBridge";

export const publishAssistantMessage = async (payload: {
  chatId: string;
  traceId: string;
  content: string;
}): Promise<void> => {
  await recordAssistantChatMessage({
    chatId: payload.chatId,
    traceId: payload.traceId,
    content: payload.content,
  });

  const response = await eventBridge.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: env.EVENT_BRIDGE_BUS_NAME,
          Source: env.EVENT_BRIDGE_SOURCE,
          DetailType: "ScheduleAssistantMessageCreated",
          Detail: JSON.stringify({
            chatId: payload.chatId,
            traceId: payload.traceId,
            content: payload.content,
            createdAt: new Date().toISOString(),
          }),
        },
      ],
    }),
  );

  if ((response.FailedEntryCount ?? 0) > 0) {
    throw new Error("Failed to publish assistant response event");
  }
};
