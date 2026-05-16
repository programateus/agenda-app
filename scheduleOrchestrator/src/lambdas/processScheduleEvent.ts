import type { SQSEvent, SQSBatchResponse } from "aws-lambda";
import { eventBridgeEnvelopeSchema } from "@src/schemas/envelope";
import { handleEntryUpserted } from "@src/handlers/handleEntryUpserted";
import { prisma } from "@src/infra/prisma";
import { handleEntryOccurrenceUpserted } from "@src/handlers/handleEntryOccurrenceUpserted";
import { handleEntryDeleted } from "@src/handlers/handleEntryDeleted";
import { ScheduleEvent } from "./types";

const handlers: Record<ScheduleEvent, (detail: unknown) => Promise<void>> = {
  ScheduleEntryCreated: handleEntryUpserted,
  ScheduleEntryUpdated: handleEntryUpserted,
  ScheduleEntryDeleted: handleEntryDeleted,
  ScheduleEntryOccurrenceUpserted: handleEntryOccurrenceUpserted,
};

export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  const batchItemFailures: SQSBatchResponse["batchItemFailures"] = [];

  for (const record of event.Records) {
    try {
      const envelope = eventBridgeEnvelopeSchema.parse(JSON.parse(record.body));

      const existingEvent = await prisma.processedEvent.findUnique({
        where: { id: envelope.id },
      });

      if (existingEvent) {
        continue;
      }

      const eventHandler = handlers[envelope["detail-type"] as ScheduleEvent];

      if (!eventHandler) {
        console.info("Ignoring unsupported event type", {
          eventId: envelope.id,
          detailType: envelope["detail-type"],
        });
      } else {
        await eventHandler(envelope.detail);
      }

      await prisma.processedEvent.create({
        data: {
          id: envelope.id,
          source: envelope.source,
          detailType: envelope["detail-type"],
        },
      });
    } catch (error) {
      console.error("Failed to process SQS record", {
        messageId: record.messageId,
        error,
      });

      batchItemFailures.push({
        itemIdentifier: record.messageId,
      });
    }
  }

  return { batchItemFailures };
}
