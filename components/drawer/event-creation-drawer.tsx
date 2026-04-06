"use client";

import { useState, useEffect } from "react";
import { RRule } from "rrule";
import { createClient } from "@/utils/supabase/client";
import { Plus } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import DateTimePicker from "@/components/date-time-picker";
import DatePicker from "@/components/date-picker";

const DAY_MAP: Record<string, any> = {
  MON: RRule.MO,
  TUE: RRule.TU,
  WED: RRule.WE,
  THU: RRule.TH,
  FRI: RRule.FR,
  SAT: RRule.SA,
  SUN: RRule.SU,
};

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

type Props = {
  onEventCreated?: (event: any) => void;
};

const EventCreationDrawer = ({ onEventCreated }: Props) => {
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [endDateTime, setEndDateTime] = useState<Date | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<
    "daily" | "weekly"
  >("daily");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [recurrenceEnd, setRecurrenceEnd] = useState<Date | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDateTime(null);
    setEndDateTime(null);
    setIsRecurring(false);
    setRecurrenceFrequency("daily");
    setSelectedDays([]);
    setRecurrenceEnd(null);
    setSelectedCategory(null);
  };

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .then(({ data }) => {
        setCategories(data || []);
      });
  }, []);

  useEffect(() => {
    if (startDateTime && recurrenceFrequency === "weekly") {
      setSelectedDays([DAY_NAMES[startDateTime.getDay()]]);
    }
  }, [startDateTime, recurrenceFrequency]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const buildRRule = (): string | null => {
    if (!isRecurring || !startDateTime) return null;

    const options: any = {
      freq: recurrenceFrequency === "daily" ? RRule.DAILY : RRule.WEEKLY,
      dtstart: startDateTime,
    };

    if (recurrenceFrequency === "weekly" && selectedDays.length > 0) {
      options.byweekday = selectedDays.map((d) => DAY_MAP[d]);
    }

    if (recurrenceEnd) options.until = recurrenceEnd;

    return new RRule(options).toString();
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    if (
      isRecurring &&
      recurrenceFrequency === "weekly" &&
      selectedDays.length === 0
    ) {
      alert("Please select at least one day");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("events")
        .insert({
          user_id: user.id,
          category_id: selectedCategory || null,
          title,
          description: description || null,
          start_time: startDateTime?.toISOString() || null,
          end_time: endDateTime?.toISOString() || null,
          is_recurring: isRecurring,
          recurrence_rule: buildRRule(),
          recurrence_start_date: startDateTime?.toISOString() || null,
          recurrence_end_date: recurrenceEnd?.toISOString() || null,
        })
        .select()
        .single();

      if (error) throw error;

      onEventCreated?.(data);
      resetForm();
      setOpen(false);
    } catch (err) {
      console.error("Failed to create event:", err);
      alert("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        if (!isOpen) {
          resetForm();
        }
      }}
    >
      <DrawerTrigger className="flex items-center gap-1.5 px-5 py-2 bg-[#121212] text-[#f9f9f7] rounded-md text-xs font-medium hover:bg-[#1a1a1a] hover:cursor-pointer">
        <Plus size={16} />
        New Event
      </DrawerTrigger>

      <DrawerContent className="p-6 space-y-6">
        <DrawerHeader className="p-0">
          <DrawerTitle>Create Event</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 no-scrollbar overflow-y-auto">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              onValueChange={setSelectedCategory}
              value={selectedCategory || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.length === 0 ? (
                    <SelectItem value="">No categories</SelectItem>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Time</Label>
            <DateTimePicker value={startDateTime} onChange={setStartDateTime} />
          </div>

          <div className="space-y-2">
            <Label>End Time</Label>
            <DateTimePicker value={endDateTime} onChange={setEndDateTime} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Recurring</Label>
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>

          {isRecurring && (
            <div className="space-y-4">
              <div className="flex rounded-md overflow-hidden border border-[#e2e2de]">
                {(["daily", "weekly"] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setRecurrenceFrequency(freq)}
                    className={`px-5 py-2 text-xs font-medium flex-1 transition-colors duration-100 cursor-pointer capitalize ${
                      recurrenceFrequency === freq
                        ? "bg-[#121212] text-[#f9f9f7]"
                        : "hover:bg-[#e8e8e5]"
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>

              {recurrenceFrequency === "weekly" && (
                <div className="flex flex-row gap-3 justify-start items-center flex-wrap">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`p-3 rounded-md text-xs font-medium transition-colors ${
                        selectedDays.includes(day)
                          ? "bg-[#121212] text-[#f9f9f7]"
                          : "bg-[#e8e8e5] text-[#121212] hover:bg-[#dcdcd8]"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label>End Date</Label>
                <DatePicker value={recurrenceEnd} onChange={setRecurrenceEnd} />
              </div>
            </div>
          )}
        </div>

        <DrawerFooter className="p-0">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Event"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EventCreationDrawer;
