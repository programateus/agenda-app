import { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar, {
  type DateClickInfo,
  type DateSelectInfo,
  type EventClickInfo,
  useCalendarController,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import themePlugin from "@fullcalendar/react/themes/monarch";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/monarch/theme.css";
import "@fullcalendar/react/themes/monarch/palettes/purple.css";
import { toast } from "@heroui/react";

import { CalendarEditor } from "./CalendarEditor";
import { CalendarToolbar } from "./CalendarToolbar";
import type {
  CalendarEditorState,
  CalendarEntryDraft,
  CalendarEntryUpdateDraft,
  CalendarView,
  CalendarProps,
  EntryFormData,
  EntryUpdateScope,
} from "./calendarTypes";
import {
  calculateEditorPosition,
  createEntryId,
  createFormValuesFromDateClick,
  createFormValuesFromEvent,
  createFormValuesFromSelection,
} from "./calendarUtils";

const isCalendarView = (value: string): value is CalendarView =>
  value === "dayGridMonth" ||
  value === "timeGridWeek" ||
  value === "timeGridDay";

export const Calendar = ({
  events,
  initialView = "dayGridMonth",
  initialDate,
  onEntryDraftCreate,
  onEntryDraftUpdate,
  onVisibleRangeChange,
}: CalendarProps) => {
  const controller = useCalendarController();
  const calendarRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorState, setEditorState] = useState<CalendarEditorState | null>(
    null,
  );
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [editorValues, setEditorValues] = useState<EntryFormData>({
    title: "",
    startDate: "",
    endDate: "",
    until: "",
    frequency: "None",
  });
  const currentViewType = controller.view?.type;
  const activeView =
    currentViewType && isCalendarView(currentViewType)
      ? currentViewType
      : initialView;

  const closeEditor = useCallback(() => {
    if (isSavingEntry) {
      return;
    }

    setEditorState(null);
  }, [isSavingEntry]);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node;

      if (editorRef.current?.contains(target)) {
        return;
      }

      closeEditor();
    },
    [closeEditor],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeEditor();
      }
    },
    [closeEditor],
  );

  useEffect(() => {
    if (!editorState) {
      return;
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editorState, handleMouseDown, handleKeyDown]);

  useEffect(() => {
    if (!editorState || !calendarRef.current) {
      return;
    }

    const handleResize = () => {
      if (!calendarRef.current) {
        return;
      }

      const bounds = calendarRef.current.getBoundingClientRect();
      const nextPosition = calculateEditorPosition(
        calendarRef.current,
        bounds.left + editorState.left,
        bounds.top + editorState.top,
      );

      setEditorState((currentState) =>
        currentState
          ? {
              ...currentState,
              ...nextPosition,
            }
          : currentState,
      );
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [editorState]);

  const openEditor = (
    clientX: number,
    clientY: number,
    nextState: Pick<
      CalendarEditorState,
      "mode" | "entryId" | "originalStartDate" | "isRecurring"
    >,
    values: EntryFormData,
  ) => {
    if (!calendarRef.current) {
      return;
    }

    setEditorValues(values);
    setEditorState({
      ...nextState,
      ...calculateEditorPosition(calendarRef.current, clientX, clientY),
    });
  };

  const closeEditorOnInteraction = () => {
    if (!editorState) {
      return false;
    }

    closeEditor();
    return true;
  };

  const handleDateClick = (info: DateClickInfo) => {
    openEditor(
      info.jsEvent.clientX,
      info.jsEvent.clientY,
      {
        mode: "create",
        entryId: createEntryId(),
        originalStartDate: undefined,
        isRecurring: false,
      },
      createFormValuesFromDateClick(info),
    );
  };

  const handleSelect = (info: DateSelectInfo) => {
    const clientX = info.jsEvent?.clientX ?? window.innerWidth / 2;
    const clientY = info.jsEvent?.clientY ?? window.innerHeight / 2;

    openEditor(
      clientX,
      clientY,
      {
        mode: "create",
        entryId: createEntryId(),
        originalStartDate: undefined,
        isRecurring: false,
      },
      createFormValuesFromSelection(info),
    );
  };

  const handleEventClick = (info: EventClickInfo) => {
    if (closeEditorOnInteraction()) {
      return;
    }

    const fallbackId = createEntryId();
    const calendarEvent = events?.find((event) => event.id === info.event.id);

    openEditor(
      info.jsEvent.clientX,
      info.jsEvent.clientY,
      {
        mode: "edit",
        entryId: String(calendarEvent?.extendedProps?.entryId ?? fallbackId),
        originalStartDate: calendarEvent?.extendedProps?.originalStartDate
          ? calendarEvent.extendedProps.originalStartDate
          : undefined,
        isRecurring: calendarEvent?.extendedProps?.frequency !== "None",
      },
      createFormValuesFromEvent(calendarEvent!, fallbackId),
    );
  };

  const handleFormSubmit = async (
    data: EntryFormData,
    scope: EntryUpdateScope,
  ) => {
    if (!editorState) {
      return;
    }

    const nextDraft: CalendarEntryDraft = {
      id: editorState.entryId,
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      until: data.frequency !== "None" && data.until ? data.until : null,
      frequency: data.frequency,
    };

    try {
      if (editorState.mode === "create") {
        setIsSavingEntry(true);
        await onEntryDraftCreate?.(nextDraft);
      } else if (editorState.originalStartDate) {
        const updateDraft: CalendarEntryUpdateDraft = {
          ...nextDraft,
          originalStartDate: editorState.originalStartDate,
          scope: editorState.isRecurring ? scope : "All",
        };

        setIsSavingEntry(true);
        await onEntryDraftUpdate?.(updateDraft);
      }

      toast.success(
        editorState.mode === "create"
          ? "Event created successfully"
          : "Event updated successfully",
      );
      setEditorState(null);
    } catch {
      toast.danger("Unable to save event. Please try again.");
    } finally {
      setIsSavingEntry(false);
    }
  };

  return (
    <div ref={calendarRef} className="relative flex h-full flex-col bg-white">
      <CalendarToolbar
        activeView={activeView}
        controller={controller}
        onInteraction={closeEditor}
        title={controller.view?.title}
      />

      <div className="min-h-0 flex-1 overflow-hidden">
        <FullCalendar
          controller={controller}
          dateClick={handleDateClick}
          datesSet={(info) => {
            onVisibleRangeChange?.({
              startDate: info.start,
              endDate: info.end,
              view: info.view.type,
            });
          }}
          eventClick={handleEventClick}
          events={events}
          headerToolbar={false}
          height="100%"
          initialDate={initialDate}
          initialView={initialView}
          plugins={[
            themePlugin,
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
          ]}
          select={handleSelect}
          selectable
          eventClass="cursor-pointer"
        />
      </div>

      <CalendarEditor
        editorRef={editorRef}
        editorState={editorState}
        initialValues={editorValues}
        isSaving={isSavingEntry}
        onClose={closeEditor}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
