"use client";

import { useState, useEffect } from "react";
import { RRule } from "rrule";
import { createClient } from "@/utils/supabase/client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
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
import { CalendarEvent, toDateStr } from "@/data/calendar";

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

type RecurringScope = "this" | "following" | "all";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  onEventUpdated: () => void;
  onEventDeleted: () => void;
};

const EventUpdateDrawer = ({
  open,
  onOpenChange,
  event,
  onEventUpdated,
  onEventDeleted,
}: Props) => {
  const supabase = createClient();

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

  const [pendingAction, setPendingAction] = useState<"save" | "delete" | null>(
    null,
  );
  const [scope, setScope] = useState<RecurringScope>("this");

  // Populate form when event changes
  useEffect(() => {
    if (!event) return;
    setTitle(event.title);
    setDescription(event.description ?? "");
    setStartDateTime(event.start_time ? new Date(event.start_time) : null);
    setEndDateTime(event.end_time ? new Date(event.end_time) : null);
    setIsRecurring(event.is_recurring);
    setSelectedCategory(event.category_id);
    setPendingAction(null);
    setScope("this");

    if (event.recurrence_rule) {
      try {
        const rule = RRule.fromString(event.recurrence_rule);
        setRecurrenceFrequency(
          rule.options.freq === RRule.WEEKLY ? "weekly" : "daily",
        );

        if (rule.options.freq === RRule.WEEKLY) {
          const localDay = DAY_NAMES[new Date(event.start_time).getDay()];
          setSelectedDays([localDay]);
        }

        setRecurrenceEnd(
          rule.options.until ? new Date(rule.options.until) : null,
        );
      } catch {}
    }
  }, [event]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleRecurringToggle = (checked: boolean) => {
    setIsRecurring(checked);
    if (!checked) {
      setSelectedDays([]);
    } else if (recurrenceFrequency === "weekly" && startDateTime) {
      setSelectedDays([DAY_NAMES[startDateTime.getDay()]]);
    }
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

  const occurrenceDate =
    event?.original_date ??
    (event?.start_time ? toDateStr(new Date(event.start_time)) : null);

  const handleSave = async (resolvedScope: RecurringScope) => {
    if (!event || !title.trim()) return;
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!event.is_recurring || resolvedScope === "all") {
        // Simple update on the base event
        const { error } = await supabase
          .from("events")
          .update({
            title,
            description: description || null,
            start_time: startDateTime?.toISOString() ?? event.start_time,
            end_time: endDateTime?.toISOString() ?? event.end_time,
            is_recurring: isRecurring,
            recurrence_rule: buildRRule(),
            recurrence_end_date: recurrenceEnd?.toISOString() ?? null,
            category_id: selectedCategory || null,
          })
          .eq("id", event.id);

        if (error) throw error;
      } else if (resolvedScope === "this") {
        // Upsert an exception for this single occurrence
        if (!occurrenceDate) throw new Error("No occurrence date");

        const { error } = await supabase.from("event_exceptions").upsert(
          {
            event_id: event.id,
            original_date: occurrenceDate,
            is_deleted: false,
            override_start_time: startDateTime?.toISOString() ?? null,
            override_end_time: endDateTime?.toISOString() ?? null,
            override_title: title !== event.title ? title : null,
            override_category_id:
              selectedCategory !== event.category_id ? selectedCategory : null,
          },
          { onConflict: "event_id,original_date" },
        );

        if (error) throw error;
      } else if (resolvedScope === "following") {
        // 1. End the original recurrence the day before this occurrence
        if (!occurrenceDate) throw new Error("No occurrence date");

        const cutoff = new Date(occurrenceDate);
        cutoff.setDate(cutoff.getDate() - 1);

        const { error: endError } = await supabase
          .from("events")
          .update({ recurrence_end_date: cutoff.toISOString() })
          .eq("id", event.id);

        if (endError) throw endError;

        // 2. Insert a new event starting from this occurrence
        const { error: insertError } = await supabase.from("events").insert({
          user_id: user.id,
          category_id: selectedCategory || null,
          title,
          description: description || null,
          start_time: startDateTime?.toISOString() ?? event.start_time,
          end_time: endDateTime?.toISOString() ?? event.end_time,
          is_recurring: isRecurring,
          recurrence_rule: buildRRule(),
          recurrence_start_date:
            startDateTime?.toISOString() ?? event.start_time,
          recurrence_end_date: recurrenceEnd?.toISOString() ?? null,
        });

        if (insertError) throw insertError;
      }

      onEventUpdated();
    } catch (err) {
      console.error("Failed to update event:", err);
      alert("Failed to update event. Please try again.");
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  const handleDelete = async (resolvedScope: RecurringScope) => {
    if (!event) return;
    setLoading(true);

    try {
      if (!event.is_recurring || resolvedScope === "all") {
        const { error } = await supabase
          .from("events")
          .delete()
          .eq("id", event.id);
        if (error) throw error;
      } else if (resolvedScope === "this") {
        if (!occurrenceDate) throw new Error("No occurrence date");

        const { error } = await supabase.from("event_exceptions").upsert(
          {
            event_id: event.id,
            original_date: occurrenceDate,
            is_deleted: true,
          },
          { onConflict: "event_id,original_date" },
        );

        if (error) throw error;
      } else if (resolvedScope === "following") {
        if (!occurrenceDate) throw new Error("No occurrence date");

        const cutoff = new Date(occurrenceDate);
        cutoff.setDate(cutoff.getDate() - 1);

        const { error } = await supabase
          .from("events")
          .update({ recurrence_end_date: cutoff.toISOString() })
          .eq("id", event.id);

        if (error) throw error;
      }

      onEventDeleted();
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Failed to delete event. Please try again.");
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  const onSaveClick = () => {
    if (event?.is_recurring) {
      setPendingAction("save");
    } else {
      handleSave("all");
    }
  };

  const onDeleteClick = () => {
    if (event?.is_recurring) {
      setPendingAction("delete");
    } else {
      handleDelete("all");
    }
  };

  const onScopeConfirm = () => {
    if (pendingAction === "save") handleSave(scope);
    else if (pendingAction === "delete") handleDelete(scope);
  };

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) setPendingAction(null);
      }}
    >
      <DrawerContent className="p-6 space-y-6">
        <DrawerHeader className="p-0">
          <DrawerTitle>
            {pendingAction ? "Apply changes to..." : "Edit Event"}
          </DrawerTitle>
        </DrawerHeader>

        {/* Scope picker — shown after clicking Save or Delete on a recurring event */}
        {pendingAction ? (
          <div className="space-y-4">
            <div className="space-y-2">
              {(
                [
                  { value: "this", label: "This event" },
                  { value: "following", label: "This and following events" },
                  { value: "all", label: "All events" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setScope(value)}
                  className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium border transition-colors ${
                    scope === value
                      ? "bg-[#121212] text-[#f9f9f7] border-[#121212]"
                      : "border-[#e2e2de] hover:bg-[#f0efeb]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <DrawerFooter className="p-0">
              <Button
                onClick={onScopeConfirm}
                disabled={loading}
                variant={pendingAction === "delete" ? "destructive" : "default"}
              >
                {loading
                  ? "..."
                  : pendingAction === "delete"
                    ? "Delete"
                    : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setPendingAction(null)}>
                Back
              </Button>
            </DrawerFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4 no-scrollbar overflow-y-auto">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
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
                <DateTimePicker
                  value={startDateTime}
                  onChange={setStartDateTime}
                />
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <DateTimePicker value={endDateTime} onChange={setEndDateTime} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Recurring</Label>
                <Switch
                  checked={isRecurring}
                  onCheckedChange={handleRecurringToggle}
                />
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
                    <DatePicker
                      value={recurrenceEnd}
                      onChange={setRecurrenceEnd}
                    />
                  </div>
                </div>
              )}
            </div>

            <DrawerFooter className="p-0">
              <Button onClick={onSaveClick} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="destructive"
                onClick={onDeleteClick}
                disabled={loading}
              >
                Delete Event
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default EventUpdateDrawer;
