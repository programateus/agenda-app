import FullCalendar, { useCalendarController } from "@fullcalendar/react";
import themePlugin from "@fullcalendar/react/themes/monarch";
import dayGridPlugin from "@fullcalendar/react/daygrid";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/monarch/theme.css";
import "@fullcalendar/react/themes/monarch/palettes/purple.css";
import { Button, ButtonGroup } from "@heroui/react";

export const Calendar = () => {
  const controller = useCalendarController();
  const buttons = controller.getButtonState();

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between p-2">
        <ButtonGroup>
          <Button>Month</Button>
          <Button>Week</Button>
          <Button>Day</Button>
        </ButtonGroup>

        <div className="font-semibold">{controller.view?.title}</div>

        <div className="space-x-2">
          <Button onClick={() => controller.today()}>
            {buttons.today.text}
          </Button>

          <ButtonGroup>
            <Button onClick={() => controller.prev()}>Previous</Button>
            <Button onClick={() => controller.next()}>Next</Button>
          </ButtonGroup>
        </div>
      </div>
      <FullCalendar
        controller={controller}
        plugins={[themePlugin, dayGridPlugin]}
        initialView="dayGridMonth"
      />
    </div>
  );
};
