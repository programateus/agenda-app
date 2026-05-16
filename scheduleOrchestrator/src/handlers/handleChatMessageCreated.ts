import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { env } from "@src/config/env";
import { eventBridge } from "@src/infra/eventBridge";
import { chatMessageCreatedSchema } from "@src/schemas/chatMessageCreated";

export async function handleChatMessageCreated(detail: unknown): Promise<void> {
  const message = chatMessageCreatedSchema.parse(detail);

  const response = await eventBridge.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: env.EVENT_BRIDGE_BUS_NAME,
          Source: env.EVENT_BRIDGE_SOURCE,
          DetailType: "ScheduleAssistantMessageCreated",
          Detail: JSON.stringify({
            chatId: message.chatId,
            traceId: message.traceId,
            content: "Recebido",
            createdAt: new Date().toISOString(),
          }),
        },
      ],
    }),
  );

  if ((response.FailedEntryCount ?? 0) > 0) {
    throw new Error("Failed to publish assistant response event");
  }
}
