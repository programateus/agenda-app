import { randomUUID } from "node:crypto";
import {
  getRecentConversationHistory,
  recordIncomingChatMessage,
} from "@src/assistant/chatHistory";
import { env } from "@src/config/env";
import {
  executePendingPayloadFallback,
  resumeAssistantGraph,
  runAssistantGraph,
} from "@src/assistant/assistantGraph";
import type { PendingScheduleActionPayload } from "@src/assistant/types";
import {
  deletePendingScheduleAction,
  findPendingScheduleAction,
  upsertPendingScheduleAction,
} from "@src/assistant/pendingActions";
import { chatMessageCreatedSchema } from "@src/schemas/chatMessageCreated";
import { publishAssistantMessage } from "./publishAssistantMessage";

const interpretConfirmation = (content: string): boolean | null => {
  const normalized = content.trim().toLocaleLowerCase("pt-BR");

  if (
    /^(sim|s|confirmo|confirmar|pode confirmar|ok|certo|prosseguir|pode prosseguir)\b/.test(
      normalized,
    )
  ) {
    return true;
  }

  if (/^(nao|n\u00e3o|n|cancelar|cancela|negativo)\b/.test(normalized)) {
    return false;
  }

  return null;
};

export async function handleChatMessageCreated(detail: unknown): Promise<void> {
  const message = chatMessageCreatedSchema.parse(detail);

  await recordIncomingChatMessage({
    messageId: message.messageId,
    chatId: message.chatId,
    userId: message.userId,
    traceId: message.traceId,
    content: message.content,
    createdAt: message.createdAt,
  });

  const pendingAction = await findPendingScheduleAction(message.chatId);

  if (pendingAction) {
    const approval = interpretConfirmation(message.content);

    if (approval === null) {
      await publishAssistantMessage({
        chatId: message.chatId,
        traceId: message.traceId,
        content: pendingAction.confirmationMessage,
      });
      return;
    }

    const pendingPayload =
      pendingAction.payload as unknown as PendingScheduleActionPayload;

    let responseContent: string;

    try {
      const resumed = await resumeAssistantGraph({
        threadId: pendingAction.threadId,
        approved: approval,
      });

      responseContent = resumed.response;
    } catch {
      responseContent = await executePendingPayloadFallback(
        pendingPayload,
        approval,
      );
    }

    await deletePendingScheduleAction(message.chatId);

    await publishAssistantMessage({
      chatId: message.chatId,
      traceId: message.traceId,
      content: responseContent,
    });
    return;
  }

  if (!env.OPENAI_API_KEY) {
    await publishAssistantMessage({
      chatId: message.chatId,
      traceId: message.traceId,
      content:
        "A integracao do assistente nao esta configurada. Defina OPENAI_API_KEY no scheduleOrchestrator.",
    });
    return;
  }

  const threadId = randomUUID();
  const conversationHistory = await getRecentConversationHistory(message.chatId, {
    excludeMessageId: message.messageId,
  });

  const result = await runAssistantGraph({
    threadId,
    chatId: message.chatId,
    userId: message.userId,
    traceId: message.traceId,
    message: message.content,
    conversationHistory,
    now: new Date(),
  });

  if (result.kind === "interrupt") {
    await upsertPendingScheduleAction({
      id: randomUUID(),
      threadId: result.threadId,
      chatId: message.chatId,
      userId: message.userId,
      traceId: message.traceId,
      operation: result.payload.operation,
      payload: result.payload,
      confirmationMessage: result.confirmationMessage,
    });

    await publishAssistantMessage({
      chatId: message.chatId,
      traceId: message.traceId,
      content: result.confirmationMessage,
    });
    return;
  }

  await publishAssistantMessage({
    chatId: message.chatId,
    traceId: message.traceId,
    content: result.response,
  });
}
