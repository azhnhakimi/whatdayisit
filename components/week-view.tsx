import {
  type CalendarEvent,
  toDateStr,
  getWeekDates,
  DAY_NAMES_SHORT,
  HOURS,
} from "@/data/calendar";
import { getContrastColor } from "@/lib/utils";

type WeekViewProps = {
  anchor: Date;
  todayStr: string;
  currentTime: Date;
  getEventsForDate: (d: string) => CalendarEvent[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onEventClick: (event: CalendarEvent) => void;
};

const HOUR_HEIGHT = 64;

const WeekView = ({
  anchor,
  todayStr,
  currentTime,
  getEventsForDate,
  scrollRef,
  onEventClick,
}: WeekViewProps) => {
  const weekDates = getWeekDates(anchor);
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const nowTop = (nowMinutes / (24 * 60)) * (HOUR_HEIGHT * 24);

  return (
    <>
      <div className="grid grid-cols-[56px_repeat(7,1fr)]">
        <div />
        {weekDates.map((date, i) => {
          const isToday = toDateStr(date) === todayStr;
          return (
            <div
              key={i}
              className={`py-2 text-center text-[10px] font-semibold uppercase ${
                isToday ? "text-[#121212]" : "text-[#888]"
              }`}
            >
              <div>{DAY_NAMES_SHORT[date.getDay()]}</div>
              <div className="text-sm font-medium">{date.getDate()}</div>
            </div>
          );
        })}
      </div>

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
                style={{ height: `${HOUR_HEIGHT * 24}px` }}
              >
                {/* Hour grid lines */}
                <div
                  className="absolute inset-0"
                  style={{ height: `${HOUR_HEIGHT * 24}px` }}
                >
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="border-b border-[#e2e2de]"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                    />
                  ))}
                </div>

                {/* Today column highlight */}
                {isToday && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "rgba(18,18,18,0.025)" }}
                  />
                )}

                {/* Events */}
                {events.map((ev) => {
                  if (!ev.start_time || !ev.end_time) return null;
                  const start = new Date(ev.start_time);
                  const end = new Date(ev.end_time);

                  const startMin = start.getHours() * 60 + start.getMinutes();
                  const endMin = end.getHours() * 60 + end.getMinutes();
                  const top = (startMin / (24 * 60)) * (HOUR_HEIGHT * 24);
                  const height = Math.max(
                    ((endMin - startMin) / (24 * 60)) * (HOUR_HEIGHT * 24),
                    20,
                  );

                  return (
                    <button
                      key={ev.id}
                      className="flex flex-col flex-start absolute left-0.5 right-0.5 rounded px-1.5 py-2 text-[#f9f9f7] text-left overflow-hidden cursor-pointer transition-all"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        zIndex: 2,
                        backgroundColor: ev.categories?.color || "#121212",
                        color: ev.categories?.color
                          ? getContrastColor(ev.categories?.color)
                          : "#ffffff",
                      }}
                      onClick={() => onEventClick(ev)}
                    >
                      <div className="text-sm font-semibold truncate">
                        {ev.title}
                      </div>
                      {height > 28 && (
                        <div className="text-xs opacity-60 truncate">
                          {new Date(ev.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          –{" "}
                          {new Date(ev.end_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
    </>
  );
};

export default WeekView;
