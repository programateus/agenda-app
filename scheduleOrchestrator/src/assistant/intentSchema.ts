import { z } from "zod";
import {
  deleteScopes,
  entryFrequencies,
  updateScopes,
} from "./types";

const localDateTimeSchema = z
  .string()
  .describe("Data e hora local no formato YYYY-MM-DDTHH:mm:ss");

const nullableLocalDateTimeSchema = localDateTimeSchema.nullable();

const eventSearchFilterSchema = z.object({
  titleQuery: z
    .string()
    .nullable()
    .describe("Trecho do titulo do evento que ajuda a identificar o alvo."),
  rangeStart: nullableLocalDateTimeSchema.describe(
    "Inicio do intervalo de busca. Use null quando nao houver intervalo claro.",
  ),
  rangeEnd: nullableLocalDateTimeSchema.describe(
    "Fim do intervalo de busca. Use null quando nao houver intervalo claro.",
  ),
  startDate: nullableLocalDateTimeSchema.describe(
    "Horario de inicio exato do evento alvo, se o usuario tiver informado.",
  ),
  endDate: nullableLocalDateTimeSchema.describe(
    "Horario de fim exato do evento alvo, se o usuario tiver informado.",
  ),
});

const createIntentSchema = z.object({
  title: z
    .string()
    .min(1)
    .describe("Titulo curto do evento, consulta, aula ou compromisso."),
  startDate: localDateTimeSchema,
  endDate: localDateTimeSchema,
  until: nullableLocalDateTimeSchema.describe(
    "Data final da recorrencia no mesmo formato, quando existir.",
  ),
  frequency: z.enum(entryFrequencies),
});

const updateIntentSchema = z.object({
  match: eventSearchFilterSchema,
  changes: z.object({
    title: z.string().nullable(),
    startDate: nullableLocalDateTimeSchema,
    endDate: nullableLocalDateTimeSchema,
    until: nullableLocalDateTimeSchema,
    frequency: z.enum(entryFrequencies).nullable(),
  }),
  scope: z.enum(updateScopes),
});

const deleteIntentSchema = z.object({
  match: eventSearchFilterSchema,
  scope: z.enum(deleteScopes),
});

const searchIntentSchema = z.object({
  titleQuery: z.string().nullable(),
  rangeStart: nullableLocalDateTimeSchema,
  rangeEnd: nullableLocalDateTimeSchema,
});

export const scheduleAssistantIntentSchema = z.object({
  action: z.enum([
    "create",
    "update",
    "delete",
    "search",
    "clarify",
    "unsupported",
  ]),
  reply: z
    .string()
    .nullable()
    .describe(
      "Resposta curta em portugues quando faltar informacao, houver ambiguidade ou o pedido nao for suportado.",
    ),
  create: createIntentSchema.nullable(),
  update: updateIntentSchema.nullable(),
  delete: deleteIntentSchema.nullable(),
  search: searchIntentSchema.nullable(),
});

export type ScheduleAssistantIntentSchema = z.infer<
  typeof scheduleAssistantIntentSchema
>;

