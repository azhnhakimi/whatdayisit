"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import {
  type CalendarEvent,
  toDateStr,
  parseTime,
  getWeekDates,
  getMonthGrid,
  MONTH_NAMES,
  DAY_NAMES_SHORT,
  HOURS,
  expandEventInRange,
  type EventException,
} from "@/data/calendar";
import MonthView from "@/components/month-view";
import WeekView from "@/components/week-view";
import EventCreationDrawer from "@/components/drawer/event-creation-drawer";
import EventUpdateDrawer from "@/components/drawer/event-update-drawer";

type ViewMode = "month" | "week";

function onDayClick(date: Date) {
  // TODO: open day detail drawer
  console.log("Day clicked:", toDateStr(date));
}

const AppCalendar = () => {
  const supabase = createClient();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState<Date>(new Date(today));
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const weekScrollRef = useRef<HTMLDivElement>(null);

  const [exceptions, setExceptions] = useState<EventException[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [updateDrawerOpen, setUpdateDrawerOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Failed to get user:", userError);
      setLoading(false);
      return;
    }

    let start: Date;
    let end: Date;

    if (viewMode === "month") {
      const grid = getMonthGrid(anchor.getFullYear(), anchor.getMonth());
      const flat = grid.flat().filter((d): d is Date => d !== null);
      start = flat[0];
      end = flat[flat.length - 1];
    } else {
      const week = getWeekDates(anchor);
      start = week[0];
      end = week[6];
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const nonRecurringFilter = `and(is_recurring.eq.false,start_time.gte.${start.toISOString()},start_time.lte.${end.toISOString()})`;

    const recurringFilter = `and(is_recurring.eq.true,or(recurrence_end_date.is.null,recurrence_end_date.gte.${start.toISOString()}))`;

    const { data, error } = await supabase
      .from("events")
      .select(
        `
    *,
    categories (
      id,
      name,
      color
    )
  `,
      )
      .eq("user_id", user.id)
      .or(`${nonRecurringFilter},${recurringFilter}`);

    if (error) {
      console.error(error);
      setEvents([]);
      setLoading(false);
      return;
    }

    const { data: exData } = await supabase
      .from("event_exceptions")
      .select("*")
      .in(
        "event_id",
        (data ?? []).map((e) => e.id),
      );

    setExceptions(exData ?? []);

    if (data) {
      const expanded = data.flatMap((event) =>
        expandEventInRange(event, start, end, exData ?? []),
      );
      console.log(expanded);

      setEvents(expanded);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [anchor, viewMode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (viewMode === "week" && weekScrollRef.current) {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const pct = minutes / (24 * 60);
      const scrollHeight = weekScrollRef.current.scrollHeight;
      weekScrollRef.current.scrollTop = scrollHeight * pct - 200;
    }
  }, [viewMode]);

  function onEventClick(event: CalendarEvent) {
    setSelectedEvent(event);
    setUpdateDrawerOpen(true);
  }

  const goNext = () => {
    const d = new Date(anchor);
    if (viewMode === "month") d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setAnchor(d);
  };

  const goPrev = () => {
    const d = new Date(anchor);
    if (viewMode === "month") d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setAnchor(d);
  };

  const goToday = () => setAnchor(new Date(today));

  const todayStr = toDateStr(today);

  const getEventsForDate = useCallback(
    (dateStr: string) => {
      return events.filter((e) => {
        if (!e.start_time) return false;

        const eventDate = new Date(e.start_time);

        // Compare using local year/month/day
        const [y, m, d] = dateStr.split("-").map(Number);
        return (
          eventDate.getFullYear() === y &&
          eventDate.getMonth() === m - 1 &&
          eventDate.getDate() === d
        );
      });
    },
    [events],
  );

  const headerLabel = () => {
    if (viewMode === "month") {
      return `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`;
    }
    const week = getWeekDates(anchor);
    const s = week[0];
    const e = week[6];
    if (s.getMonth() === e.getMonth()) {
      return `${MONTH_NAMES[s.getMonth()]} ${s.getFullYear()}`;
    }
    return `${MONTH_NAMES[s.getMonth()]} – ${MONTH_NAMES[e.getMonth()]} ${e.getFullYear()}`;
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-[#f9f9f7] text-[#121212] font-sans select-none"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        .cal-scroll::-webkit-scrollbar { width: 4px; }
        .cal-scroll::-webkit-scrollbar-track { background: transparent; }
        .cal-scroll::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 2px; }
        .event-badge:hover { filter: brightness(0.92); }
        .week-event:hover { filter: brightness(0.88); }
        .day-cell:hover { background: #f0efeb !important; }
        .nav-btn:hover { background: #ebebeb; }
        .today-btn:hover { background: #1a1a1a !important; }
        .toggle-btn-active { background: #121212; color: #f9f9f7; }
        .toggle-btn-inactive:hover { background: #e8e8e5; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2e2de]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight">
            {headerLabel()}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              className="nav-btn w-7 h-7 flex items-center justify-center rounded-md transition-colors duration-100 cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goNext}
              className="nav-btn w-7 h-7 flex items-center justify-center rounded-md transition-colors duration-100 cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <button
            onClick={goToday}
            className="today-btn px-4 py-2 text-xs font-medium bg-[#121212] text-[#f9f9f7] rounded-md transition-colors duration-100 cursor-pointer"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md overflow-hidden border border-[#e2e2de]">
            <button
              onClick={() => setViewMode("month")}
              className={`px-5 py-2 text-xs font-medium transition-colors duration-100 cursor-pointer ${viewMode === "month" ? "toggle-btn-active" : "toggle-btn-inactive"}`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-5 py-2 text-xs font-medium transition-colors duration-100 cursor-pointer ${viewMode === "week" ? "toggle-btn-active" : "toggle-btn-inactive"}`}
            >
              Week
            </button>
          </div>

          <EventCreationDrawer onEventCreated={fetchEvents} />
          <EventUpdateDrawer
            open={updateDrawerOpen}
            onOpenChange={setUpdateDrawerOpen}
            event={selectedEvent}
            onEventUpdated={() => {
              fetchEvents();
              setUpdateDrawerOpen(false);
            }}
            onEventDeleted={() => {
              fetchEvents();
              setUpdateDrawerOpen(false);
            }}
          />
        </div>
      </div>

      {viewMode === "month" ? (
        <MonthView
          anchor={anchor}
          todayStr={todayStr}
          getEventsForDate={getEventsForDate}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
        />
      ) : (
        <WeekView
          anchor={anchor}
          todayStr={todayStr}
          currentTime={currentTime}
          getEventsForDate={getEventsForDate}
          scrollRef={weekScrollRef}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
};

export default AppCalendar;
