import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { type CalendarEvent } from "@/data/calendar";
import { getContrastColor } from "@/lib/utils";

type DayDetailsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: CalendarEvent[] | [];
  date?: Date;
};

function formatPrettyDate(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);

  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "long" });
  const year = date.getFullYear();

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${getOrdinal(day)} ${month} ${year}`;
}

const DayDetailsDrawer = ({
  open,
  onOpenChange,
  events,
  date,
}: DayDetailsDrawerProps) => {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-6 space-y-6">
        <DrawerHeader className="p-0">
          <DrawerTitle className="text-lg">
            Events on {formatPrettyDate(date?.toISOString())}
          </DrawerTitle>
        </DrawerHeader>

        {events.length === 0 && (
          <p className="text-slate-400">No events on this day.</p>
        )}

        <div className="space-y-6">
          {events.map((event, index) => (
            <div
              key={index}
              className="border border-slate-400 bg-[#f9f9f7] rounded-md p-2"
              style={{
                backgroundColor: event.categories?.color || "#121212",
                color: event.categories?.color
                  ? getContrastColor(event.categories?.color)
                  : "#ffffff",
              }}
            >
              <p>{event.title}</p>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DayDetailsDrawer;
