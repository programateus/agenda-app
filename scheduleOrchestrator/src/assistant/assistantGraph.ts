import {
  Command,
  MemorySaver,
  StateGraph,
  Annotation,
  interrupt,
  isInterrupted,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { env } from "@src/config/env";
import type { ConversationMessage } from "./chatHistory";
import {
  addHours,
  formatLocalDateTime,
  formatHumanDateTime,
  formatHumanDateTimeRange,
  formatNowForPrompt,
} from "./dateTime";
import { enqueueBackendScheduleCommand } from "./backendCommands";
import { findEventMatches } from "./entrySearch";
import { scheduleAssistantIntentSchema } from "./intentSchema";
import type {
  BackendScheduleCommand,
  CreateIntent,
  EventMatch,
  PendingScheduleActionPayload,
  ScheduleAssistantIntent,
} from "./types";

const replace = <T>(defaultValue: () => T) =>
  Annotation<T>({
    reducer: (_current, update) => update,
    default: defaultValue,
  });

const ScheduleAssistantState = Annotation.Root({
  message: replace(() => ""),
  conversationHistory: replace<ConversationMessage[]>(() => []),
  chatId: replace(() => ""),
  userId: replace(() => ""),
  traceId: replace(() => ""),
  now: replace(() => ""),
  intent: replace<ScheduleAssistantIntent | null>(() => null),
  matches: replace<EventMatch[]>(() => []),
  pendingPayload: replace<PendingScheduleActionPayload | null>(() => null),
  confirmationMessage: replace<string | null>(() => null),
  approved: replace<boolean | null>(() => null),
  response: replace<string | null>(() => null),
});

type ScheduleAssistantStateType = typeof ScheduleAssistantState.State;

const buildConversationMessages = (
  history: ConversationMessage[],
): BaseMessage[] => {
  return history.reduce<BaseMessage[]>((messages, message) => {
    const content = message.content.trim();

    if (!content) {
      return messages;
    }

    if (message.role === "assistant") {
      messages.push(new AIMessage(content));
      return messages;
    }

    if (message.role === "system") {
      messages.push(new SystemMessage(content));
      return messages;
    }

    messages.push(new HumanMessage(content));
    return messages;
  }, []);
};

const checkpointer = new MemorySaver();

const model = new ChatOpenAI({
  model: env.OPENAI_MODEL,
  temperature: 0,
});

const intentModel = model.withStructuredOutput(scheduleAssistantIntentSchema, {
  name: "schedule_assistant_intent",
});

const normalizeCreateIntent = (intent: CreateIntent): CreateIntent => {
  if (intent.endDate) {
    return intent;
  }

  const endDate = addHours(new Date(intent.startDate), 1);

  return {
    ...intent,
    endDate: formatLocalDateTime(endDate),
  };
};

const buildSearchResponse = (matches: EventMatch[]) => {
  if (!matches.length) {
    return "Nao encontrei eventos nesse periodo.";
  }

  const preview = matches
    .slice(0, 8)
    .map(
      (match, index) =>
        `${index + 1}. ${match.title} - ${formatHumanDateTimeRange(match.startDate, match.endDate)}`,
    )
    .join("\n");

  const suffix =
    matches.length > 8
      ? `\n\nMostrei 8 de ${matches.length} resultados. Se quiser, refine por titulo, dia ou horario.`
      : "";

  return `Encontrei estes eventos:\n${preview}${suffix}`;
};

const buildCreateCommand = (
  state: ScheduleAssistantStateType,
  intent: CreateIntent,
): PendingScheduleActionPayload => {
  const normalizedIntent = normalizeCreateIntent(intent);
  const successMessage = `Evento "${normalizedIntent.title}" criado para ${formatHumanDateTimeRange(normalizedIntent.startDate, normalizedIntent.endDate)}.`;

  const backendCommand: BackendScheduleCommand = {
    operation: "create",
    chatId: state.chatId,
    userId: state.userId,
    traceId: state.traceId,
    successMessage,
    title: normalizedIntent.title,
    startDate: normalizedIntent.startDate,
    endDate: normalizedIntent.endDate,
    until: normalizedIntent.until,
    frequency: normalizedIntent.frequency,
  };

  return {
    operation: "create",
    backendCommand,
    processingMessage: "Confirmacao recebida. Vou criar o evento agora.",
  };
};

const buildUpdateCommand = (
  state: ScheduleAssistantStateType,
  match: EventMatch,
): PendingScheduleActionPayload => {
  const intent = state.intent?.update;

  if (!intent) {
    throw new Error("Update intent is required");
  }

  const durationMs =
    new Date(match.endDate).getTime() - new Date(match.startDate).getTime();
  const nextStartDate = intent.changes.startDate ?? match.startDate;
  const nextEndDate =
    intent.changes.endDate ??
    formatLocalDateTime(
      new Date(new Date(nextStartDate).getTime() + durationMs),
    );
  const nextTitle = intent.changes.title ?? match.title;
  const nextFrequency = intent.changes.frequency ?? match.frequency;
  const nextUntil =
    intent.changes.until !== null && intent.changes.until !== undefined
      ? intent.changes.until
      : match.until;
  const successMessage = `Evento "${nextTitle}" atualizado para ${formatHumanDateTimeRange(nextStartDate, nextEndDate)}.`;

  const backendCommand: BackendScheduleCommand = {
    operation: "update",
    chatId: state.chatId,
    userId: state.userId,
    traceId: state.traceId,
    successMessage,
    entryId: match.entryId,
    originalStartDate: match.originalStartDate,
    scope: intent.scope,
    title: nextTitle,
    startDate: nextStartDate,
    endDate: nextEndDate,
    until: nextUntil,
    frequency: nextFrequency,
  };

  return {
    operation: "update",
    backendCommand,
    processingMessage: "Confirmacao recebida. Vou atualizar o evento agora.",
  };
};

const buildDeleteCommand = (
  state: ScheduleAssistantStateType,
  match: EventMatch,
): PendingScheduleActionPayload => {
  const intent = state.intent?.delete;

  if (!intent) {
    throw new Error("Delete intent is required");
  }

  const successMessage = `Evento "${match.title}" removido do calendario.`;

  const backendCommand: BackendScheduleCommand = {
    operation: "delete",
    chatId: state.chatId,
    userId: state.userId,
    traceId: state.traceId,
    successMessage,
    entryId: match.entryId,
    originalStartDate: match.originalStartDate,
    scope: intent.scope,
  };

  return {
    operation: "delete",
    backendCommand,
    processingMessage: "Confirmacao recebida. Vou remover o evento agora.",
  };
};

const buildConfirmationMessage = (
  payload: PendingScheduleActionPayload,
): string => {
  const command = payload.backendCommand;

  if (command.operation === "create") {
    return [
      "Confirme os dados antes de criar o evento:",
      `Titulo: ${command.title}`,
      `Quando: ${formatHumanDateTimeRange(command.startDate, command.endDate)}`,
      `Frequencia: ${command.frequency}`,
      `Recorrencia ate: ${command.until ? formatHumanDateTime(command.until) : "sem recorrencia"}`,
      "",
      'Responda "sim" para confirmar ou "nao" para cancelar.',
    ].join("\n");
  }

  if (command.operation === "update") {
    return [
      "Confirme os dados antes de atualizar o evento:",
      `Titulo: ${command.title}`,
      `Quando: ${formatHumanDateTimeRange(command.startDate, command.endDate)}`,
      `Escopo: ${command.scope}`,
      `Frequencia: ${command.frequency}`,
      `Recorrencia ate: ${command.until ? formatHumanDateTime(command.until) : "sem recorrencia"}`,
      "",
      'Responda "sim" para confirmar ou "nao" para cancelar.',
    ].join("\n");
  }

  return [
    "Confirme a remocao do evento:",
    `Evento: ${command.successMessage.replace(" removido do calendario.", "")}`,
    `Escopo: ${command.scope}`,
    "",
    'Responda "sim" para confirmar ou "nao" para cancelar.',
  ].join("\n");
};

const understandRequest = async (state: ScheduleAssistantStateType) => {
  const conversationMessages = buildConversationMessages(
    state.conversationHistory,
  );

  const intent = await intentModel.invoke([
    new SystemMessage(
      [
        "Voce interpreta pedidos de agenda em portugues para um calendario.",
        "Data e hora de referencia:",
        state.now,
        "",
        "Regras obrigatorias:",
        "- Responda apenas com estrutura valida para o schema.",
        "- Datas e horas devem estar no formato local YYYY-MM-DDTHH:mm:ss sem timezone.",
        "- Quando o usuario pedir para criar um evento e nao informar duracao, use 1 hora.",
        "- Use frequency None para eventos sem recorrencia.",
        "- Use action clarify quando faltar titulo, data ou hora suficiente para concluir com seguranca.",
        "- Use action search quando o usuario quiser consultar eventos em uma ou mais datas.",
        "- Use action update quando o usuario quiser alterar horario, titulo, data, recorrencia ou duracao.",
        "- Use action delete quando o usuario quiser remover evento(s).",
        "- Considere o historico recente da conversa para resolver referencias como 'esse', 'o mesmo horario', 'amanha' e pedidos de continuidade.",
      ].join("\n"),
    ),
    ...conversationMessages,
    new HumanMessage(state.message),
  ]);

  return {
    intent,
    response:
      intent.action === "clarify" || intent.action === "unsupported"
        ? intent.reply
        : null,
  };
};

const searchEvents = async (state: ScheduleAssistantStateType) => {
  const filter = state.intent?.search;

  if (!filter) {
    return {
      response: "Nao consegui entender o intervalo que voce quer consultar.",
    };
  }

  const matches = await findEventMatches(state.userId, {
    titleQuery: filter.titleQuery,
    rangeStart: filter.rangeStart,
    rangeEnd: filter.rangeEnd,
    startDate: null,
    endDate: null,
  });

  return {
    matches,
    response: buildSearchResponse(matches),
  };
};

const resolveMutationTarget = async (state: ScheduleAssistantStateType) => {
  const filter = state.intent?.update?.match ?? state.intent?.delete?.match;

  if (!filter) {
    return {
      response: "Nao consegui identificar qual evento voce quer alterar.",
    };
  }

  const matches = await findEventMatches(state.userId, filter);

  if (!matches.length) {
    return {
      response:
        "Nao encontrei um evento correspondente para atualizar ou remover.",
    };
  }

  if (matches.length > 1) {
    const options = matches
      .slice(0, 5)
      .map(
        (match, index) =>
          `${index + 1}. ${match.title} - ${formatHumanDateTimeRange(match.startDate, match.endDate)}`,
      )
      .join("\n");

    return {
      matches,
      response: `Encontrei mais de um evento parecido. Refine o pedido com titulo, dia ou horario:\n${options}`,
    };
  }

  return { matches };
};

const prepareMutation = async (state: ScheduleAssistantStateType) => {
  const intent = state.intent;

  if (!intent) {
    return {
      response: "Nao consegui preparar a acao solicitada.",
    };
  }

  let pendingPayload: PendingScheduleActionPayload;

  if (intent.action === "create" && intent.create) {
    pendingPayload = buildCreateCommand(state, intent.create);
  } else if (intent.action === "update") {
    const match = state.matches[0];
    if (!match) {
      return {
        response:
          "Preciso identificar exatamente qual evento voce quer atualizar.",
      };
    }

    pendingPayload = buildUpdateCommand(state, match);
  } else if (intent.action === "delete") {
    const match = state.matches[0];
    if (!match) {
      return {
        response:
          "Preciso identificar exatamente qual evento voce quer remover.",
      };
    }

    pendingPayload = buildDeleteCommand(state, match);
  } else {
    return {
      response: "Nao encontrei uma acao suportada para esse pedido.",
    };
  }

  return {
    pendingPayload,
    confirmationMessage: buildConfirmationMessage(pendingPayload),
  };
};

const reviewMutation = async (state: ScheduleAssistantStateType) => {
  if (!state.pendingPayload || !state.confirmationMessage) {
    return {
      response: "Nao consegui preparar a confirmacao da operacao.",
    };
  }

  const approved = interrupt<
    {
      kind: "calendar_confirmation";
      message: string;
      payload: PendingScheduleActionPayload;
    },
    boolean
  >({
    kind: "calendar_confirmation",
    message: state.confirmationMessage,
    payload: state.pendingPayload,
  });

  return { approved };
};

const executeMutation = async (state: ScheduleAssistantStateType) => {
  if (state.approved !== true) {
    return {
      response: "Tudo bem, nao fiz nenhuma alteracao no calendario.",
    };
  }

  if (!state.pendingPayload) {
    return {
      response: "Perdi os dados da operacao pendente. Pode reenviar o pedido?",
    };
  }

  await enqueueBackendScheduleCommand(state.pendingPayload.backendCommand);

  return {
    response: state.pendingPayload.processingMessage,
  };
};

const routeAfterUnderstanding = (state: ScheduleAssistantStateType) => {
  if (
    state.intent?.action === "clarify" ||
    state.intent?.action === "unsupported"
  ) {
    return "finish";
  }

  if (state.intent?.action === "search") {
    return "search";
  }

  if (state.intent?.action === "create") {
    return "prepare";
  }

  return "resolve";
};

const routeAfterResolving = (state: ScheduleAssistantStateType) => {
  return state.response ? "finish" : "prepare";
};

export const graph = new StateGraph(ScheduleAssistantState)
  .addNode("understand", understandRequest)
  .addNode("search", searchEvents)
  .addNode("resolve", resolveMutationTarget)
  .addNode("prepare", prepareMutation)
  .addNode("review", reviewMutation)
  .addNode("execute", executeMutation)
  .addNode("finish", () => ({}))
  .addEdge("__start__", "understand")
  .addConditionalEdges("understand", routeAfterUnderstanding)
  .addConditionalEdges("resolve", routeAfterResolving)
  .addEdge("search", "finish")
  .addEdge("prepare", "review")
  .addEdge("review", "execute")
  .addEdge("execute", "finish")
  .addEdge("finish", "__end__")
  .compile({
    checkpointer,
  });

type GraphRunResult =
  | {
      kind: "response";
      response: string;
    }
  | {
      kind: "interrupt";
      threadId: string;
      confirmationMessage: string;
      payload: PendingScheduleActionPayload;
    };

const getResponseFromState = (state: ScheduleAssistantStateType) =>
  state.response?.trim() ||
  "Nao consegui gerar uma resposta para essa mensagem.";

export const runAssistantGraph = async (input: {
  threadId: string;
  chatId: string;
  userId: string;
  traceId: string;
  message: string;
  conversationHistory: ConversationMessage[];
  now: Date;
}): Promise<GraphRunResult> => {
  const config = {
    configurable: {
      thread_id: input.threadId,
    },
  };

  const result = await graph.invoke(
    {
      message: input.message,
      conversationHistory: input.conversationHistory,
      chatId: input.chatId,
      userId: input.userId,
      traceId: input.traceId,
      now: formatNowForPrompt(input.now),
    },
    config,
  );

  if (isInterrupted(result)) {
    const snapshot = await graph.getState(config);
    const values = snapshot.values as ScheduleAssistantStateType;

    if (!values.pendingPayload || !values.confirmationMessage) {
      throw new Error("Interrupted graph did not persist pending payload");
    }

    return {
      kind: "interrupt",
      threadId: input.threadId,
      confirmationMessage: values.confirmationMessage,
      payload: values.pendingPayload,
    };
  }

  return {
    kind: "response",
    response: getResponseFromState(result as ScheduleAssistantStateType),
  };
};

export const resumeAssistantGraph = async (input: {
  threadId: string;
  approved: boolean;
}): Promise<{ kind: "response"; response: string }> => {
  const config = {
    configurable: {
      thread_id: input.threadId,
    },
  };

  const result = await graph.invoke(
    new Command({
      resume: input.approved,
    }),
    config,
  );

  return {
    kind: "response",
    response: getResponseFromState(result as ScheduleAssistantStateType),
  };
};

export const executePendingPayloadFallback = async (
  payload: PendingScheduleActionPayload,
  approved: boolean,
): Promise<string> => {
  if (!approved) {
    return "Tudo bem, nao fiz nenhuma alteracao no calendario.";
  }

  await enqueueBackendScheduleCommand(payload.backendCommand);
  return payload.processingMessage;
};
