import { prisma } from "@src/infra/prisma";
import { entryOccurrenceSchema } from "@src/schemas/entryOccurrence";

export async function handleEntryOccurrenceUpserted(
  detail: unknown,
): Promise<void> {
  const entryOccurrence = entryOccurrenceSchema.parse(detail);

  await prisma.entryOccurrence.upsert({
    where: { id: entryOccurrence.id },
    create: {
      id: entryOccurrence.id,
      title: entryOccurrence.title,
      startDate: new Date(entryOccurrence.startDate),
      endDate: new Date(entryOccurrence.endDate),
      originalStartDate: new Date(entryOccurrence.originalStartDate),
      entryId: entryOccurrence.entryId,
      isCanceled: entryOccurrence.isCanceled,
      createdAt: new Date(entryOccurrence.createdAt),
      updatedAt: new Date(entryOccurrence.updatedAt),
    },
    update: {
      id: entryOccurrence.id,
      title: entryOccurrence.title,
      startDate: new Date(entryOccurrence.startDate),
      endDate: new Date(entryOccurrence.endDate),
      originalStartDate: new Date(entryOccurrence.originalStartDate),
      entryId: entryOccurrence.entryId,
      isCanceled: entryOccurrence.isCanceled,
      createdAt: new Date(entryOccurrence.createdAt),
      updatedAt: new Date(entryOccurrence.updatedAt),
    },
  });
}
