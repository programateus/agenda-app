import { prisma } from "@src/infra/prisma";
import { deleteEntrySchema } from "@src/schemas/deleteEntry";

export async function handleEntryDeleted(details: unknown) {
  var payload = deleteEntrySchema.parse(details);

  await prisma.entry.delete({
    where: {
      id: payload.entryId,
      userId: payload.userId,
    },
  });
}
