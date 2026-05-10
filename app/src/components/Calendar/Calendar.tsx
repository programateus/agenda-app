import FullCalendar, {
  type DateInput,
  type EventInput,
  useCalendarController,
} from "@fullcalendar/react";
import themePlugin from "@fullcalendar/react/themes/monarch";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/monarch/theme.css";
import "@fullcalendar/react/themes/monarch/palettes/purple.css";
import { Button, ButtonGroup } from "@heroui/react";

type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

export interface CalendarProps {
  events?: EventInput[];
  initialView?: CalendarView;
  initialDate?: DateInput;
}

const viewOptions: Array<{ label: string; value: CalendarView }> = [
  { label: "Month", value: "dayGridMonth" },
  { label: "Week", value: "timeGridWeek" },
  { label: "Day", value: "timeGridDay" },
];

export const Calendar = ({
  events,
  initialView = "dayGridMonth",
  initialDate,
}: CalendarProps) => {
  const controller = useCalendarController();
  const buttons = controller.getButtonState();
  const activeView = controller.view?.type ?? initialView;

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between p-2">
        <ButtonGroup>
          {viewOptions.map((viewOption) => (
            <Button
              key={viewOption.value}
              variant={activeView === viewOption.value ? "primary" : "outline"}
              onClick={() => controller.changeView(viewOption.value)}
            >
              {viewOption.label}
            </Button>
          ))}
        </ButtonGroup>

        <div className="font-semibold">{controller.view?.title}</div>

        <div className="space-x-2">
          <Button
            isDisabled={buttons.today.isDisabled}
            onClick={() => controller.today()}
          >
            {buttons.today.text}
          </Button>

          <ButtonGroup>
            <Button
              isDisabled={buttons.prev.isDisabled}
              onClick={() => controller.prev()}
            >
              Previous
            </Button>
            <Button
              isDisabled={buttons.next.isDisabled}
              onClick={() => controller.next()}
            >
              Next
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <FullCalendar
          controller={controller}
          events={events}
          headerToolbar={false}
          height="100%"
          initialDate={initialDate}
          initialView={initialView}
          plugins={[themePlugin, dayGridPlugin, timeGridPlugin]}
        />
      </div>
    </div>
  );
};
