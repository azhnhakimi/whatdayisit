import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { type CalendarEvent } from "@/data/calendar";

type HolidayDetailsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
};

const HolidayDetailsDrawer = ({
  open,
  onOpenChange,
  event,
}: HolidayDetailsDrawerProps) => {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-6 space-y-6">
        <DrawerHeader className="p-0">
          <DrawerTitle className="text-lg">Holiday Details</DrawerTitle>
        </DrawerHeader>

        <div className="text-md">
          <p className="text-lg font-semibold">{event?.title}</p>
          <p className="text-lg font-semibold">{event?.description}</p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default HolidayDetailsDrawer;
