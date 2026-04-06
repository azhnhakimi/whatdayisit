export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  color?: string;
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

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Standup",
    date: getTodayStr(),
    startTime: "09:00",
    endTime: "09:30",
  },
  {
    id: "2",
    title: "Design Review",
    date: getTodayStr(),
    startTime: "11:00",
    endTime: "12:00",
  },
  {
    id: "3",
    title: "Lunch w/ Sarah",
    date: getTodayStr(),
    startTime: "12:30",
    endTime: "13:30",
  },
  {
    id: "4",
    title: "Sprint Planning",
    date: getOffsetDateStr(1),
    startTime: "10:00",
    endTime: "11:30",
  },
  {
    id: "5",
    title: "1:1 with Manager",
    date: getOffsetDateStr(1),
    startTime: "15:00",
    endTime: "15:30",
  },
  {
    id: "6",
    title: "Product Demo",
    date: getOffsetDateStr(2),
    startTime: "14:00",
    endTime: "15:00",
  },
  {
    id: "7",
    title: "All Hands",
    date: getOffsetDateStr(-1),
    startTime: "09:00",
    endTime: "10:00",
  },
  {
    id: "8",
    title: "Retrospective",
    date: getOffsetDateStr(3),
    startTime: "16:00",
    endTime: "17:00",
  },
  {
    id: "9",
    title: "Client Call",
    date: getOffsetDateStr(3),
    startTime: "11:00",
    endTime: "11:45",
  },
  {
    id: "10",
    title: "Workshop",
    date: getOffsetDateStr(-2),
    startTime: "13:00",
    endTime: "17:00",
  },
];
