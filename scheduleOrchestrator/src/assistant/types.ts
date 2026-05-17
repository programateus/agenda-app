export const entryFrequencies = [
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
  "Custom",
  "None",
] as const;

export const updateScopes = ["Single", "Forward", "All"] as const;
export const deleteScopes = ["Single", "All"] as const;

export type EntryFrequency = (typeof entryFrequencies)[number];
export type UpdateScope = (typeof updateScopes)[number];
export type DeleteScope = (typeof deleteScopes)[number];

export type EventSearchFilter = {
  titleQuery: string | null;
  rangeStart: string | null;
  rangeEnd: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type EventMatch = {
  entryId: string;
  occurrenceId: string;
  title: string;
  startDate: string;
  endDate: string;
  originalStartDate: string;
  frequency: EntryFrequency;
  until: string | null;
};

export type CreateIntent = {
  title: string;
  startDate: string;
  endDate: string;
  until: string | null;
  frequency: EntryFrequency;
};

export type UpdateIntent = {
  match: EventSearchFilter;
  changes: {
    title: string | null;
    startDate: string | null;
    endDate: string | null;
    until: string | null;
    frequency: EntryFrequency | null;
  };
  scope: UpdateScope;
};

export type DeleteIntent = {
  match: EventSearchFilter;
  scope: DeleteScope;
};

export type SearchIntent = {
  titleQuery: string | null;
  rangeStart: string | null;
  rangeEnd: string | null;
};

export type ScheduleAssistantIntent = {
  action: "create" | "update" | "delete" | "search" | "clarify" | "unsupported";
  reply: string | null;
  create: CreateIntent | null;
  update: UpdateIntent | null;
  delete: DeleteIntent | null;
  search: SearchIntent | null;
};

type BaseBackendScheduleCommand = {
  operation: "create" | "update" | "delete";
  chatId: string;
  userId: string;
  traceId: string;
  successMessage: string;
};

export type CreateBackendScheduleCommand = BaseBackendScheduleCommand & {
  operation: "create";
  title: string;
  startDate: string;
  endDate: string;
  until: string | null;
  frequency: EntryFrequency;
};

export type UpdateBackendScheduleCommand = BaseBackendScheduleCommand & {
  operation: "update";
  entryId: string;
  originalStartDate: string;
  scope: UpdateScope;
  title: string;
  startDate: string;
  endDate: string;
  until: string | null;
  frequency: EntryFrequency;
};

export type DeleteBackendScheduleCommand = BaseBackendScheduleCommand & {
  operation: "delete";
  entryId: string;
  originalStartDate: string;
  scope: DeleteScope;
};

export type BackendScheduleCommand =
  | CreateBackendScheduleCommand
  | UpdateBackendScheduleCommand
  | DeleteBackendScheduleCommand;

export type PendingScheduleActionPayload = {
  operation: BackendScheduleCommand["operation"];
  backendCommand: BackendScheduleCommand;
  processingMessage: string;
};

