import type { Prisma } from "@prisma/client";
import { prisma } from "@src/infra/prisma";
import {
  addDays,
  addFrequency,
  endOfDay,
  formatLocalDateTime,
  hasOverlap,
  parseLocalDateTime,
  startOfDay,
} from "./dateTime";
import type { EntryFrequency, EventMatch, EventSearchFilter } from "./types";

type EntryWithOccurrences = Prisma.EntryGetPayload<{
  include: { entryOccurrences: true };
}>;

const DEFAULT_LOOKAHEAD_DAYS = 90;

const toEventMatch = (
  entry: EntryWithOccurrences,
  occurrence: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    originalStartDate: Date;
  },
): EventMatch => ({
  entryId: entry.id,
  occurrenceId: occurrence.id,
  title: occurrence.title,
  startDate: formatLocalDateTime(occurrence.startDate),
  endDate: formatLocalDateTime(occurrence.endDate),
  originalStartDate: formatLocalDateTime(occurrence.originalStartDate),
  frequency: entry.frequency as EntryFrequency,
  until: entry.until ? formatLocalDateTime(entry.until) : null,
});

const getSearchRange = (filter: {
  rangeStart?: string | null;
  rangeEnd?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}) => {
  const now = new Date();
  const rangeStart = filter.rangeStart
    ? parseLocalDateTime(filter.rangeStart)
    : filter.startDate
      ? parseLocalDateTime(filter.startDate)
    : startOfDay(now);
  const rangeEnd = filter.rangeEnd
    ? parseLocalDateTime(filter.rangeEnd)
    : filter.endDate
      ? parseLocalDateTime(filter.endDate)
    : endOfDay(addDays(rangeStart, DEFAULT_LOOKAHEAD_DAYS));

  return { rangeStart, rangeEnd };
};

const buildVirtualOccurrence = (
  entry: EntryWithOccurrences,
  originalStartDate: Date,
): EventMatch => {
  const durationMs = entry.endDate.getTime() - entry.startDate.getTime();
  const endDate = new Date(originalStartDate.getTime() + durationMs);

  return {
    entryId: entry.id,
    occurrenceId: `${entry.id}:${formatLocalDateTime(originalStartDate)}`,
    title: entry.title,
    startDate: formatLocalDateTime(originalStartDate),
    endDate: formatLocalDateTime(endDate),
    originalStartDate: formatLocalDateTime(originalStartDate),
    frequency: entry.frequency as EntryFrequency,
    until: entry.until ? formatLocalDateTime(entry.until) : null,
  };
};

const getOccurrenceOverridesByOriginalStart = (entry: EntryWithOccurrences) => {
  return new Map(
    entry.entryOccurrences.map((occurrence) => [
      formatLocalDateTime(occurrence.originalStartDate),
      occurrence,
    ]),
  );
};

const expandEntryOccurrences = (
  entry: EntryWithOccurrences,
  rangeStart: Date,
  rangeEnd: Date,
): EventMatch[] => {
  const matches: EventMatch[] = [];
  const seenOriginalStarts = new Set<string>();
  const overridesByOriginalStart = getOccurrenceOverridesByOriginalStart(entry);

  const pushOccurrence = (occurrence: EventMatch) => {
    if (seenOriginalStarts.has(occurrence.originalStartDate)) {
      return;
    }

    if (
      !hasOverlap(
        parseLocalDateTime(occurrence.startDate),
        parseLocalDateTime(occurrence.endDate),
        rangeStart,
        rangeEnd,
      )
    ) {
      return;
    }

    seenOriginalStarts.add(occurrence.originalStartDate);
    matches.push(occurrence);
  };

  if (entry.frequency === "None" || entry.frequency === "Custom") {
    const override = overridesByOriginalStart.get(formatLocalDateTime(entry.startDate));

    if (override) {
      if (!override.isCanceled) {
        pushOccurrence(toEventMatch(entry, override));
      }
    } else if (hasOverlap(entry.startDate, entry.endDate, rangeStart, rangeEnd)) {
      pushOccurrence(buildVirtualOccurrence(entry, entry.startDate));
    }
  } else {
    let occurrenceStart = new Date(entry.startDate);

    while (occurrenceStart <= rangeEnd) {
      if (entry.until && occurrenceStart > endOfDay(entry.until)) {
        break;
      }

      const occurrenceKey = formatLocalDateTime(occurrenceStart);
      const override = overridesByOriginalStart.get(occurrenceKey);

      if (override) {
        if (!override.isCanceled) {
          pushOccurrence(toEventMatch(entry, override));
        }
      } else {
        pushOccurrence(buildVirtualOccurrence(entry, occurrenceStart));
      }

      const nextOccurrenceStart = addFrequency(
        occurrenceStart,
        entry.frequency as EntryFrequency,
      );

      if (!nextOccurrenceStart) {
        break;
      }

      occurrenceStart = nextOccurrenceStart;
    }
  }

  for (const override of entry.entryOccurrences) {
    if (override.isCanceled) {
      continue;
    }

    pushOccurrence(toEventMatch(entry, override));
  }

  return matches.sort((left, right) =>
    left.startDate.localeCompare(right.startDate),
  );
};

const filterByTitle = (match: EventMatch, titleQuery: string | null) => {
  if (!titleQuery) {
    return true;
  }

  return match.title.toLowerCase().includes(titleQuery.toLowerCase());
};

const filterByExactDate = (
  match: EventMatch,
  filter: Pick<EventSearchFilter, "startDate" | "endDate">,
) => {
  if (filter.startDate && match.startDate !== filter.startDate) {
    return false;
  }

  if (filter.endDate && match.endDate !== filter.endDate) {
    return false;
  }

  return true;
};

export const findEventMatches = async (
  userId: string,
  filter: EventSearchFilter,
): Promise<EventMatch[]> => {
  const { rangeStart, rangeEnd } = getSearchRange(filter);

  const entries = await prisma.entry.findMany({
    where: {
      userId,
      OR: [
        {
          frequency: "None",
          startDate: { lt: rangeEnd },
          endDate: { gt: rangeStart },
        },
        {
          frequency: {
            not: "None",
          },
        },
      ],
    },
    include: {
      entryOccurrences: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return entries
    .flatMap((entry) => expandEntryOccurrences(entry, rangeStart, rangeEnd))
    .filter((match) => filterByTitle(match, filter.titleQuery))
    .filter((match) => filterByExactDate(match, filter))
    .sort((left, right) => left.startDate.localeCompare(right.startDate));
};
