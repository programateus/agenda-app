import type { CalendarController } from "@fullcalendar/react";
import { Button, ButtonGroup } from "@heroui/react";

import type { CalendarView } from "./calendarTypes";
import { viewOptions } from "./calendarUtils";

interface CalendarToolbarProps {
  activeView: CalendarView;
  controller: CalendarController;
  onInteraction?: () => void;
  title?: string;
}

export const CalendarToolbar = ({
  activeView,
  controller,
  onInteraction,
  title,
}: CalendarToolbarProps) => {
  const buttons = controller.getButtonState();

  const handleInteraction = (action: () => void) => {
    onInteraction?.();
    action();
  };

  return (
    <div className="flex shrink-0 items-center justify-between p-2">
      <ButtonGroup>
        {viewOptions.map((viewOption) => (
          <Button
            key={viewOption.value}
            variant={activeView === viewOption.value ? "primary" : "outline"}
            onClick={() =>
              handleInteraction(() => controller.changeView(viewOption.value))
            }
          >
            {viewOption.label}
          </Button>
        ))}
      </ButtonGroup>

      <div className="font-semibold">{title}</div>

      <div className="space-x-2">
        <Button
          isDisabled={buttons.today.isDisabled}
          onClick={() => handleInteraction(() => controller.today())}
        >
          {buttons.today.text}
        </Button>

        <ButtonGroup>
          <Button
            isDisabled={buttons.prev.isDisabled}
            onClick={() => handleInteraction(() => controller.prev())}
          >
            Previous
          </Button>
          <Button
            isDisabled={buttons.next.isDisabled}
            onClick={() => handleInteraction(() => controller.next())}
          >
            Next
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};
