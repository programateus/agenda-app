import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ENDPOINT_URL: z.string().optional(),
  EVENT_BRIDGE_BUS_NAME: z.string(),
  EVENT_BRIDGE_SOURCE: z.string(),
  BACKEND_COMMANDS_QUEUE_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  SCHEDULE_ORCHESTRATOR_EVENTS_QUEUE_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
