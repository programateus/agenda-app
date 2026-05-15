import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  Surface,
  TextField,
} from "@heroui/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";

import type {
  CalendarEditorState,
  EntryFormData,
  EntryFrequency,
  EntryUpdateScope,
} from "./calendarTypes";
import { frequencyOptions } from "./calendarUtils";
import { entryFormSchema } from "./schema";

interface CalendarEditorProps {
  editorState: CalendarEditorState | null;
  editorRef: React.RefObject<HTMLDivElement | null>;
  initialValues: EntryFormData;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (
    data: EntryFormData,
    scope: EntryUpdateScope,
  ) => Promise<void> | void;
}

export const CalendarEditor = ({
  editorState,
  editorRef,
  initialValues,
  isSaving,
  onClose,
  onSubmit,
}: CalendarEditorProps) => {
  const [updateScope, setUpdateScope] = useState<EntryUpdateScope>("All");
  const {
    clearErrors,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState,
  } = useForm<EntryFormData>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });
  const [hasUntil, setHasUntil] = useState(
    initialValues.frequency !== "None" && Boolean(initialValues.until),
  );
  const frequency = useWatch({ control, name: "frequency" });
  const until = useWatch({ control, name: "until" });

  useEffect(() => {
    reset(initialValues);
    setHasUntil(
      initialValues.frequency !== "None" && Boolean(initialValues.until),
    );
    setUpdateScope("All");
  }, [initialValues, reset]);

  useEffect(() => {
    if (frequency !== "None" || (!hasUntil && !until)) {
      return;
    }

    setHasUntil(false);
    clearErrors("until");
    setValue("until", "", {
      shouldDirty: Boolean(until),
      shouldValidate: true,
    });
  }, [clearErrors, frequency, hasUntil, setValue, until]);

  if (!editorState) {
    return null;
  }

  const handleUntilToggle = (isSelected: boolean) => {
    setHasUntil(isSelected);

    if (isSelected) {
      return;
    }

    clearErrors("until");
    setValue("until", "", {
      shouldDirty: Boolean(until),
      shouldValidate: true,
    });
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    if (hasUntil && !data.until) {
      setError("until", {
        type: "manual",
        message: "Until date is required",
      });
      return;
    }

    await onSubmit(data, updateScope);
  });

  const isDisabled = formState.isSubmitting || isSaving;
  const showUntilControls = frequency !== "None";

  return (
    <div
      ref={editorRef}
      className="absolute z-20"
      style={{
        left: editorState.left,
        top: editorState.top,
        width: editorState.width,
      }}
    >
      <Surface
        className="overflow-y-auto rounded-3xl border border-zinc-200 p-4 shadow-2xl"
        style={{ maxHeight: editorState.maxHeight }}
      >
        <Form onSubmit={handleFormSubmit} className="space-y-4">
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

          {showUntilControls ? (
            <div className="space-y-3 rounded-2xl border border-zinc-200 p-3">
              <Checkbox
                isSelected={hasUntil}
                onChange={handleUntilToggle}
                isDisabled={isDisabled}
              >
                Event has an end date
              </Checkbox>

              {hasUntil ? (
                <Controller
                  name="until"
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
                      <Label className="font-semibold">Until</Label>
                      <Input type="date" />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </TextField>
                  )}
                />
              ) : null}
            </div>
          ) : null}

          {editorState.mode === "edit" && editorState.isRecurring ? (
            <div className="space-y-2 rounded-2xl border border-zinc-200 p-3">
              <Label className="font-semibold">Apply changes to</Label>
              <select
                className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-0"
                value={updateScope}
                onChange={(event) =>
                  setUpdateScope(event.target.value as EntryUpdateScope)
                }
                disabled={isDisabled}
              >
                <option value="Single">Only this event</option>
                <option value="Forward">This and following events</option>
                <option value="All">All events</option>
              </select>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              isDisabled={isDisabled}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isDisabled={isDisabled}>
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
