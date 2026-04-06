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
): CalendarEvent[] {
  if (!event.start_time) return [];

  if (!event.is_recurring || !event.recurrence_rule) {
    const start = new Date(event.start_time);

    if (start >= rangeStart && start <= rangeEnd) {
      return [event];
    }

    return [];
  }

  try {
    const dtstart = new Date(event.start_time)
      .toISOString()
      .replace(/[-:]|\.\d{3}/g, "");

    const fullRule = `DTSTART:${dtstart}\n${event.recurrence_rule}`;

    const rule = rrulestr(fullRule);

    const dates = rule.between(rangeStart, rangeEnd, true);

    const originalStart = new Date(event.start_time);
    const originalEnd = new Date(event.end_time);
    const duration = originalEnd.getTime() - originalStart.getTime();

    return dates.map((date) => ({
      ...event,
      start_time: new Date(date).toISOString(),
      end_time: new Date(date.getTime() + duration).toISOString(),
    }));
  } catch (err) {
    console.error("Failed to parse recurrence rule:", err);
    return [];
  }
}
