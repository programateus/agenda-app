import { useMutation } from "@tanstack/react-query";

import { createEntry } from "@/services/entries";

export const useCreateEntryMutation = () => {
  return useMutation({
    mutationFn: createEntry,
  });
};
