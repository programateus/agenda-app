import { useEffect, useMemo, useRef, useState } from "react";
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
  CalendarView,
  CalendarProps,
  EntryFormData,
} from "./calendarTypes";
import {
  calculateEditorPosition,
  createDraftFromEventInput,
  createEntryId,
  createEventInputFromDraft,
  createFormValuesFromDateClick,
  createFormValuesFromSelection,
  mergeDraftEntries,
} from "./calendarUtils";

const isCalendarView = (value: string): value is CalendarView =>
  value === "dayGridMonth" ||
  value === "timeGridWeek" ||
  value === "timeGridDay";

export const Calendar = ({
  events,
  initialView = "dayGridMonth",
  initialDate,
  onEntryDraftSubmit,
}: CalendarProps) => {
  const controller = useCalendarController();
  const calendarRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [draftEntries, setDraftEntries] = useState<
    Record<string, CalendarEntryDraft>
  >({});
  const [editorState, setEditorState] = useState<CalendarEditorState | null>(
    null,
  );
  const [editorValues, setEditorValues] = useState<EntryFormData>({
    title: "",
    startDate: "",
    endDate: "",
    frequency: "None",
  });
  const currentViewType = controller.view?.type;
  const activeView =
    currentViewType && isCalendarView(currentViewType)
      ? currentViewType
      : initialView;
  const displayEvents = useMemo(
    () =>
      mergeDraftEntries(events ?? [], draftEntries).map(
        createEventInputFromDraft,
      ),
    [draftEntries, events],
  );

  const closeEditor = () => {
    setEditorState(null);
  };

  useEffect(() => {
    if (!editorState) {
      return;
    }

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.currentTarget as Node;

      if (editorRef.current?.contains(target)) {
        return;
      }

      closeEditor();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeEditor();
      }
    };

    const handleWindowBlur = () => {
      closeEditor();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        closeEditor();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [editorState]);

  const openEditor = (
    clientX: number,
    clientY: number,
    mode: CalendarEditorState["mode"],
    entryId: string,
    values: EntryFormData,
  ) => {
    if (!calendarRef.current) {
      return;
    }

    setEditorValues(values);
    setEditorState({
      mode,
      entryId,
      ...calculateEditorPosition(calendarRef.current, clientX, clientY),
    });
  };

  const handleDateClick = (info: DateClickInfo) => {
    openEditor(
      info.jsEvent.clientX,
      info.jsEvent.clientY,
      "create",
      createEntryId(),
      createFormValuesFromDateClick(info),
    );
  };

  const handleSelect = (info: DateSelectInfo) => {
    const clientX = info.jsEvent?.clientX ?? window.innerWidth / 2;
    const clientY = info.jsEvent?.clientY ?? window.innerHeight / 2;

    openEditor(
      clientX,
      clientY,
      "create",
      createEntryId(),
      createFormValuesFromSelection(info),
    );
  };

  const handleEventClick = (info: EventClickInfo) => {
    const fallbackId = createEntryId();
    const eventDraft = draftEntries[info.event.id]
      ? draftEntries[info.event.id]
      : createDraftFromEventInput(
          {
            id: info.event.id || fallbackId,
            title: info.event.title,
            start: info.event.start ?? undefined,
            end: info.event.end ?? undefined,
            extendedProps: info.event.extendedProps,
          },
          fallbackId,
        );

    openEditor(
      info.jsEvent.clientX,
      info.jsEvent.clientY,
      "edit",
      eventDraft.id,
      {
        title: eventDraft.title,
        startDate: eventDraft.startDate,
        endDate: eventDraft.endDate,
        frequency: eventDraft.frequency,
      },
    );
  };

  const handleFormSubmit = (data: EntryFormData) => {
    if (!editorState) {
      return;
    }

    const nextDraft: CalendarEntryDraft = {
      id: editorState.entryId,
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      frequency: data.frequency,
    };

    setDraftEntries((currentDrafts) => ({
      ...currentDrafts,
      [nextDraft.id]: nextDraft,
    }));

    onEntryDraftSubmit?.(nextDraft);
    toast.success(
      editorState.mode === "create"
        ? "Event created locally"
        : "Event updated locally",
    );
    closeEditor();
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
          eventClick={handleEventClick}
          events={displayEvents}
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
        />
      </div>

      <CalendarEditor
        editorRef={editorRef}
        editorState={editorState}
        initialValues={editorValues}
        onClose={closeEditor}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
