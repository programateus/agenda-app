import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ENDPOINT_URL: z.string().optional(),
  BACKEND_COMMANDS_QUEUE_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  SCHEDULE_ORCHESTRATOR_EVENTS_QUEUE_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
