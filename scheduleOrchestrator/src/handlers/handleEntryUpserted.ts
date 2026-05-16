import { entrySchema } from "@src/schemas/entry";
import { prisma } from "@src/infra/prisma";

export async function handleEntryUpserted(detail: unknown): Promise<void> {
  const entry = entrySchema.parse(detail);

  await prisma.entry.upsert({
    where: { id: entry.entryId },
    update: {
      userId: entry.userId,
      title: entry.title,
      startDate: new Date(entry.startDate),
      endDate: new Date(entry.endDate),
      until: entry.until ? new Date(entry.until) : null,
      frequency: entry.frequency,
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt),
    },
    create: {
      id: entry.entryId,
      userId: entry.userId,
      title: entry.title,
      startDate: new Date(entry.startDate),
      endDate: new Date(entry.endDate),
      until: entry.until ? new Date(entry.until) : null,
      frequency: entry.frequency,
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt),
    },
  });
}
