import { z } from "zod";
import { flexDateSchema } from "./utils";

export const frequencySchema = z.enum([
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
  "Custom",
  "None",
]);

const frequencyByIndex = [
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
  "Custom",
  "None",
] as const;

const rawEntryCreatedSchema = z.object({
  Id: z.uuid(),
  Title: z.string().min(1),
  StartDate: flexDateSchema,
  EndDate: flexDateSchema,
  Until: flexDateSchema.nullable(),
  Frequency: z.number().int().min(0).max(5),
  OwnerId: z.uuid(),
  CreatedAt: flexDateSchema,
  UpdatedAt: flexDateSchema,
  EntryOccurrences: z.array(z.unknown()),
});

export const entryCreatedSchema = rawEntryCreatedSchema.transform((entry) => ({
  entryId: entry.Id,
  userId: entry.OwnerId,
  title: entry.Title,
  startDate: entry.StartDate,
  endDate: entry.EndDate,
  until: entry.Until,
  frequency: frequencyByIndex[entry.Frequency],
  createdAt: entry.CreatedAt,
  updatedAt: entry.UpdatedAt,
}));

export type EntryCreatedPayload = z.infer<typeof entryCreatedSchema>;
