import z from "zod";

export const deleteEntrySchema = z.object({
  entryId: z.uuid(),
  userId: z.uuid(),
});

export type DeleteEntryPayload = z.infer<typeof deleteEntrySchema>;
