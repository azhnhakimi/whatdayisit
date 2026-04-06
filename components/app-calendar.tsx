"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import {
  type CalendarEvent,
  toDateStr,
  parseTime,
  getWeekDates,
  getMonthGrid,
  MOCK_CALENDAR_EVENTS,
  MONTH_NAMES,
  DAY_NAMES_SHORT,
  HOURS,
} from "@/data/calendar";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import EventCreationDrawer from "@/components/drawer/event-creation-drawer";

type ViewMode = "month" | "week";

function onDayClick(date: Date) {
  // TODO: open day detail drawer
  console.log("Day clicked:", toDateStr(date));
}

function onEventClick(event: CalendarEvent) {
  // TODO: open event detail drawer
  console.log("Event clicked:", event);
}

const AppCalendar = () => {
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState<Date>(new Date(today));
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const weekScrollRef = useRef<HTMLDivElement>(null);

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

  const getEventsForDate = useCallback((dateStr: string) => {
    return MOCK_CALENDAR_EVENTS.filter((e) => e.date === dateStr);
  }, []);

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

          <EventCreationDrawer />
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-[#e2e2de]">
        {DAY_NAMES_SHORT.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-semibold tracking-widest uppercase text-[#888]"
          >
            {d}
          </div>
        ))}
      </div>

      {viewMode === "month" ? (
        <MonthView
          anchor={anchor}
          todayStr={todayStr}
          getEventsForDate={getEventsForDate}
        />
      ) : (
        <WeekView
          anchor={anchor}
          todayStr={todayStr}
          currentTime={currentTime}
          getEventsForDate={getEventsForDate}
          scrollRef={weekScrollRef}
        />
      )}
    </div>
  );
};

interface MonthViewProps {
  anchor: Date;
  todayStr: string;
  getEventsForDate: (d: string) => CalendarEvent[];
}

const MonthView = ({ anchor, todayStr, getEventsForDate }: MonthViewProps) => {
  const grid = getMonthGrid(anchor.getFullYear(), anchor.getMonth());

  return (
    <div className="flex-1 overflow-auto cal-scroll">
      {grid.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((date, di) => {
            if (!date) {
              return (
                <div
                  key={di}
                  className="relative border-b border-r border-[#e2e2de] bg-[#f5f5f2]"
                >
                  <div style={{ paddingBottom: "100%" }} />
                </div>
              );
            }
            const ds = toDateStr(date);
            const events = getEventsForDate(ds);
            const isToday = ds === todayStr;
            const isCurrentMonth = date.getMonth() === anchor.getMonth();

            return (
              <div
                key={di}
                className="day-cell relative border-b border-r border-[#e2e2de] cursor-pointer transition-colors duration-100"
                style={{ background: isToday ? "#f0f0ec" : undefined }}
                onClick={() => onDayClick(date)}
              >
                <div style={{ paddingBottom: "100%" }} />
                <div className="absolute inset-0 p-1.5 flex flex-col gap-1">
                  <div className="flex justify-end">
                    <span
                      className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                        isToday
                          ? "bg-[#121212] text-[#f9f9f7]"
                          : isCurrentMonth
                            ? "text-[#121212]"
                            : "text-[#bbb]"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {events.slice(0, 3).map((ev) => (
                      <button
                        key={ev.id}
                        className="event-badge w-full text-left px-1.5 py-2 rounded text-[10px] font-medium bg-[#121212] text-[#f9f9f7] truncate transition-all cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(ev);
                        }}
                      >
                        {ev.title}
                      </button>
                    ))}
                    {events.length > 3 && (
                      <span className="text-[9px] text-[#888] pl-1">
                        +{events.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

interface WeekViewProps {
  anchor: Date;
  todayStr: string;
  currentTime: Date;
  getEventsForDate: (d: string) => CalendarEvent[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const HOUR_HEIGHT = 64;

const WeekView = ({
  anchor,
  todayStr,
  currentTime,
  getEventsForDate,
  scrollRef,
}: WeekViewProps) => {
  const weekDates = getWeekDates(anchor);
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const nowTop = (nowMinutes / (24 * 60)) * (HOUR_HEIGHT * 24);

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto cal-scroll">
      <div className="flex" style={{ minWidth: 0 }}>
        {/* Time gutter */}
        <div className="shrink-0 w-14 border-r border-[#e2e2de] relative">
          {HOURS.map((h) => (
            <div
              key={h}
              className="border-b border-[#e2e2de] flex items-start justify-end pr-2"
              style={{ height: `${HOUR_HEIGHT}px` }}
            >
              {h > 0 && (
                <span className="text-[10px] text-[#aaa] -mt-2.5">
                  {h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDates.map((date, di) => {
          const ds = toDateStr(date);
          const events = getEventsForDate(ds);
          const isToday = ds === todayStr;

          return (
            <div
              key={di}
              className="flex-1 relative border-r border-[#e2e2de]"
              style={{ minWidth: 0 }}
            >
              {/* Hour grid lines */}
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="border-b border-[#e2e2de]"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                />
              ))}

              {/* Today column highlight */}
              {isToday && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "rgba(18,18,18,0.025)" }}
                />
              )}

              {/* Events */}
              {events.map((ev) => {
                if (!ev.startTime || !ev.endTime) return null;
                const startMin = parseTime(ev.startTime);
                const endMin = parseTime(ev.endTime);
                const top = (startMin / (24 * 60)) * (HOUR_HEIGHT * 24);
                const height = Math.max(
                  ((endMin - startMin) / (24 * 60)) * (HOUR_HEIGHT * 24),
                  20,
                );

                return (
                  <button
                    key={ev.id}
                    className="week-event absolute left-0.5 right-0.5 rounded px-1.5 py-1 bg-[#121212] text-[#f9f9f7] text-left overflow-hidden cursor-pointer transition-all"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      zIndex: 2,
                    }}
                    onClick={() => onEventClick(ev)}
                  >
                    <div className="text-[10px] font-semibold truncate">
                      {ev.title}
                    </div>
                    {height > 28 && (
                      <div className="text-[9px] opacity-60 truncate">
                        {ev.startTime} – {ev.endTime}
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Current time indicator */}
              {isToday && (
                <div
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{ top: `${nowTop}px`, zIndex: 10 }}
                >
                  <div className="relative flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#121212] -ml-1 shrink-0" />
                    <div className="flex-1 h-px bg-[#121212]" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppCalendar;
