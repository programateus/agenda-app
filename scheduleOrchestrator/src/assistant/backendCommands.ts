import { env } from "@src/config/env";
import { publishJsonMessage } from "@src/infra/sqs";
import type { BackendScheduleCommand } from "./types";

export const enqueueBackendScheduleCommand = async (
  command: BackendScheduleCommand,
): Promise<void> => {
  if (!env.BACKEND_COMMANDS_QUEUE_URL) {
    throw new Error("BACKEND_COMMANDS_QUEUE_URL is required");
  }

  await publishJsonMessage(env.BACKEND_COMMANDS_QUEUE_URL, command);
};

