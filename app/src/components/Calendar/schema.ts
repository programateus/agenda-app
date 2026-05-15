import z from "zod";
import { frequencyOptions } from "./calendarUtils";

export const entryFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(100, "Title must have at most 100 characters"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    until: z.string(),
    frequency: z.enum(frequencyOptions),
  })
  .superRefine(({ startDate, endDate, until, frequency }, ctx) => {
    if (new Date(endDate) < new Date(startDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }

    if (
      frequency !== "None" &&
      until &&
      new Date(until) < new Date(startDate)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["until"],
        message: "Until date must be on or after start date",
      });
    }
  });
