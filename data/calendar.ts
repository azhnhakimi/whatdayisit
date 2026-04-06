import { rrulestr } from "rrule";

export type CalendarEvent = {
  id: string;
  user_id: string;
  category_id: string | null;
  categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  recurrence_start_date: string | null;
  recurrence_end_date: string | null;
  created_at: string;
  original_date?: string;
};

export type EventException = {
  id: string;
  event_id: string;
  original_date: string;
  is_deleted: boolean;
  override_start_time: string | null;
  override_end_time: string | null;
  override_title: string | null;
  override_category_id: string | null;
  created_at: string;
};

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DAY_NAMES_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getOffsetDateStr(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function getWeekDates(anchor: Date): Date[] {
  const d = new Date(anchor);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(d);
    nd.setDate(d.getDate() + i);
    return nd;
  });
}

export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function expandEventInRange(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date,
  exceptions: EventException[] = [],
): CalendarEvent[] {
  if (!event.start_time) return [];

  const exceptionMap = new Map<string, EventException>();
  for (const ex of exceptions) {
    if (ex.event_id === event.id) {
      exceptionMap.set(ex.original_date, ex);
    }
  }

  if (!event.is_recurring || !event.recurrence_rule) {
    const startUTC = new Date(event.start_time);
    if (startUTC >= rangeStart && startUTC <= rangeEnd) {
      return [event];
    }
    return [];
  }

  try {
    const startUTC = new Date(event.start_time);
    const endUTC = new Date(event.end_time);
    const duration = endUTC.getTime() - startUTC.getTime();

    const dtstartLocal = event.recurrence_start_date
      ? new Date(event.recurrence_start_date)
      : startUTC;

    const rule = rrulestr(event.recurrence_rule, { dtstart: dtstartLocal });

    const dates = rule.between(rangeStart, rangeEnd, true);

    const results = dates.flatMap((dateLocal) => {
      const dateStr = toDateStr(dateLocal); // YYYY-MM-DD in local time
      const exception = exceptionMap.get(dateStr);

      if (exception?.is_deleted) return [];

      // Apply exception overrides if available, else default
      const startTime = exception?.override_start_time
        ? new Date(exception.override_start_time).toISOString()
        : new Date(dateLocal.getTime()).toISOString();

      const endTime = exception?.override_end_time
        ? new Date(exception.override_end_time).toISOString()
        : new Date(dateLocal.getTime() + duration).toISOString();

      return [
        {
          ...event,
          title: exception?.override_title ?? event.title,
          category_id: exception?.override_category_id ?? event.category_id,
          start_time: startTime,
          end_time: endTime,
          original_date: dateStr,
        },
      ];
    });

    return results;
  } catch (err) {
    console.error("Failed to parse recurrence rule:", err);
    return [];
  }
}
