import { z } from "zod";

export const eventBridgeEnvelopeSchema = z.object({
  id: z.string(),
  source: z.string(),
  "detail-type": z.string(),
  time: z.string().optional(),
  detail: z.unknown(),
});

export const sqsFixtureSchema = z.object({
  MessageId: z.string(),
  ReceiptHandle: z.string(),
  MD5OfBody: z.string(),
  Body: eventBridgeEnvelopeSchema,
});

export type EventBridgeEnvelope = z.infer<typeof eventBridgeEnvelopeSchema>;
export type SqsFixture = z.infer<typeof sqsFixtureSchema>;
