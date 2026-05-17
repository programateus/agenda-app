import type { PendingScheduleAction } from "@prisma/client";
import { prisma } from "@src/infra/prisma";
import type { PendingScheduleActionPayload } from "./types";

export type PendingScheduleActionRecord = {
  id: string;
  threadId: string;
  chatId: string;
  userId: string;
  traceId: string;
  operation: string;
  payload: PendingScheduleActionPayload;
  confirmationMessage: string;
};

const mapPendingAction = (
  record: PendingScheduleAction,
): PendingScheduleActionRecord => {
  return {
    id: record.id,
    threadId: record.threadId,
    chatId: record.chatId,
    userId: record.userId,
    traceId: record.traceId,
    operation: record.operation,
    payload: record.payload as PendingScheduleActionPayload,
    confirmationMessage: record.confirmationMessage,
  };
};

export const findPendingScheduleAction = async (
  chatId: string,
): Promise<PendingScheduleActionRecord | null> => {
  const record = await prisma.pendingScheduleAction.findUnique({
    where: {
      chatId,
    },
  });

  return record ? mapPendingAction(record) : null;
};

export const upsertPendingScheduleAction = async (input: {
  id: string;
  threadId: string;
  chatId: string;
  userId: string;
  traceId: string;
  operation: string;
  payload: PendingScheduleActionPayload;
  confirmationMessage: string;
}): Promise<void> => {
  await prisma.pendingScheduleAction.upsert({
    where: {
      chatId: input.chatId,
    },
    update: {
      threadId: input.threadId,
      userId: input.userId,
      traceId: input.traceId,
      operation: input.operation,
      payload: input.payload,
      confirmationMessage: input.confirmationMessage,
    },
    create: {
      id: input.id,
      threadId: input.threadId,
      chatId: input.chatId,
      userId: input.userId,
      traceId: input.traceId,
      operation: input.operation,
      payload: input.payload,
      confirmationMessage: input.confirmationMessage,
    },
  });
};

export const deletePendingScheduleAction = async (
  chatId: string,
): Promise<void> => {
  await prisma.pendingScheduleAction.deleteMany({
    where: {
      chatId,
    },
  });
};
