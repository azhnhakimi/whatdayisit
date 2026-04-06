import {
  type CalendarEvent,
  toDateStr,
  parseTime,
  getWeekDates,
  getMonthGrid,
  MONTH_NAMES,
  DAY_NAMES_SHORT,
  HOURS,
} from "@/data/calendar";

type MonthViewProps = {
  anchor: Date;
  todayStr: string;
  getEventsForDate: (date: string) => CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
};

const MonthView = ({
  anchor,
  todayStr,
  getEventsForDate,
  onDayClick,
  onEventClick,
}: MonthViewProps) => {
  const grid = getMonthGrid(anchor.getFullYear(), anchor.getMonth());

  return (
    <>
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
                          className="text-xs w-full text-left px-1.5 py-2 rounded font-medium text-[#f9f9f7] truncate transition-all cursor-pointer"
                          style={{
                            backgroundColor: ev.categories?.color || "#121212",
                          }}
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
    </>
  );
};

export default MonthView;
