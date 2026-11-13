import type { DayCount } from "../types";

// Formats a date as "YYYY-MM-DD" in the phone's local timezone.
export function toLocalDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// Midnight (local time) at the start of the oldest day in a window that ends today.
// Built with new Date(y, m, d - n) so daylight-saving changes cannot shift the day.
export function windowStart(days: number, now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
}

// One entry per local day, oldest first, zero days included.
export function countByLocalDay(timestamps: number[], days: number, now: Date): DayCount[] {
  const start = windowStart(days, now);
  const counts = new Map<string, number>();
  const dates: string[] = [];

  for (let offset = 0; offset < days; offset++) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
    const date = toLocalDateKey(day);
    dates.push(date);
    counts.set(date, 0);
  }

  for (const timestamp of timestamps) {
    const date = toLocalDateKey(new Date(timestamp));
    const current = counts.get(date);
    if (current !== undefined) counts.set(date, current + 1);
  }

  return dates.map((date) => ({ date, count: counts.get(date) ?? 0 }));
}
