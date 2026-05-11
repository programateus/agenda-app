import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  Surface,
  TextField,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";

import type {
  CalendarEditorState,
  EntryFormData,
  EntryFrequency,
} from "./calendarTypes";
import { frequencyOptions, tooltipWidth } from "./calendarUtils";

const entryFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(100, "Title must have at most 100 characters"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    frequency: z.enum(frequencyOptions),
  })
  .superRefine(({ startDate, endDate }, ctx) => {
    if (new Date(endDate) < new Date(startDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }
  });

interface CalendarEditorProps {
  editorState: CalendarEditorState | null;
  editorRef: React.RefObject<HTMLDivElement | null>;
  initialValues: EntryFormData;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (data: EntryFormData) => Promise<void> | void;
}

export const CalendarEditor = ({
  editorState,
  editorRef,
  initialValues,
  isSaving,
  onClose,
  onSubmit,
}: CalendarEditorProps) => {
  const { control, handleSubmit, reset, formState } = useForm<EntryFormData>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  if (!editorState) {
    return null;
  }

  const isDisabled = formState.isSubmitting || isSaving;

  return (
    <div
      ref={editorRef}
      className="absolute z-20"
      style={{
        left: editorState.left,
        top: editorState.top,
        width: tooltipWidth,
      }}
    >
      <Surface className="rounded-3xl border border-zinc-200 p-4 shadow-2xl">
        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                {editorState.mode === "create" ? "New event" : "Edit event"}
              </h2>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              isDisabled={isDisabled}
            >
              Close
            </Button>
          </div>

          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                isRequired
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                isInvalid={fieldState.invalid}
                isDisabled={isDisabled}
                validationBehavior="aria"
              >
                <Label className="font-semibold">Title</Label>
                <Input placeholder="Event title" />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />

          <Controller
            name="startDate"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                isRequired
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                isInvalid={fieldState.invalid}
                isDisabled={isDisabled}
                validationBehavior="aria"
              >
                <Label className="font-semibold">Start</Label>
                <Input type="datetime-local" />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                isRequired
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                isInvalid={fieldState.invalid}
                isDisabled={isDisabled}
                validationBehavior="aria"
              >
                <Label className="font-semibold">End</Label>
                <Input type="datetime-local" />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />

          <Controller
            name="frequency"
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label className="font-semibold">Frequency</Label>
                <select
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-0"
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(event.target.value as EntryFrequency)
                  }
                  onBlur={field.onBlur}
                  disabled={isDisabled}
                >
                  {frequencyOptions.map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {frequency}
                    </option>
                  ))}
                </select>
                <FieldError>{fieldState.error?.message}</FieldError>
              </div>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              isDisabled={isDisabled}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isDisabled={isDisabled}
            >
              {isDisabled ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Saving...
                </span>
              ) : editorState.mode === "create" ? (
                "Create event"
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </Form>
      </Surface>
    </div>
  );
};
