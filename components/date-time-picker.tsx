import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Calendar as CalendarIcon } from "lucide-react";

type DateTimePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

const DateTimePicker = ({ value, onChange }: DateTimePickerProps) => {
  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;

    const newDate = new Date(date);

    if (value) {
      newDate.setHours(value.getHours());
      newDate.setMinutes(value.getMinutes());
    }

    onChange(newDate);
  };

  const handleTimeChange = (time: Date | null) => {
    if (!time) {
      onChange(null);
      return;
    }

    const newDate = new Date(value ?? new Date());

    newDate.setHours(time.getHours());
    newDate.setMinutes(time.getMinutes());

    onChange(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-full justify-between text-left">
          {value ? (
            <span>
              {value.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : (
            <span>Pick a date</span>
          )}
          <CalendarIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full" onWheel={(e) => e.stopPropagation()}>
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={handleDateChange}
          defaultMonth={value ?? undefined}
          required
          className="w-full"
        />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TimePicker
            label="Select time"
            value={value}
            onChange={handleTimeChange}
            slotProps={{
              popper: {
                disablePortal: true,
                sx: { zIndex: 9999 },
              },
            }}
          />
        </LocalizationProvider>
      </PopoverContent>
    </Popover>
  );
};

export default DateTimePicker;
