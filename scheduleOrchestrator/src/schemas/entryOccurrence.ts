import z from "zod";
import { flexDateSchema } from "./utils";

const ec = {
  Id: "c7ca88e2-093d-4f89-8ba3-7feb0fde509f",
  Title: "Teste publish recorrente",
  StartDate: "2026-05-26T09:00:00",
  OriginalStartDate: "2026-05-26T09:00:00",
  EndDate: "2026-05-26T10:00:00",
  IsCanceled: false,
  EntryId: "a5a9a93d-c842-4e89-bdbc-1f235285555d",
  CreatedAt: "2026-05-16T12:27:41.5410325-03:00",
  UpdatedAt: "2026-05-16T12:27:41.5410337-03:00",
};

const rawEntryOccurrenceSchema = z.object({
  Id: z.uuid(),
  Title: z.string().min(1),
  StartDate: flexDateSchema,
  EndDate: flexDateSchema,
  OriginalStartDate: flexDateSchema,
  EntryId: z.uuid(),
  IsCanceled: z.boolean(),
  CreatedAt: flexDateSchema,
  UpdatedAt: flexDateSchema,
});

export const entryOccurrenceSchema = rawEntryOccurrenceSchema.transform(
  (entryOccurrence) => ({
    id: entryOccurrence.Id,
    title: entryOccurrence.Title,
    startDate: entryOccurrence.StartDate,
    endDate: entryOccurrence.EndDate,
    originalStartDate: entryOccurrence.OriginalStartDate,
    entryId: entryOccurrence.EntryId,
    isCanceled: entryOccurrence.IsCanceled,
    createdAt: entryOccurrence.CreatedAt,
    updatedAt: entryOccurrence.UpdatedAt,
  }),
);

export type EntryOccurrencePayload = z.infer<typeof entryOccurrenceSchema>;
