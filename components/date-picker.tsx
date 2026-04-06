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

type DatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

const DatePicker = ({ value, onChange }: DatePickerProps) => {
  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;

    const newDate = new Date(date);

    if (value) {
      newDate.setHours(value.getHours());
      newDate.setMinutes(value.getMinutes());
    }

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
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
