/**
 * NYSE market-hours calculation.
 *
 * Computed from rules, not a hardcoded date list, so it stays correct in
 * future years without maintenance: floating holidays (MLK Day, Good
 * Friday, Thanksgiving, ...) are derived from the calendar, and fixed
 * holidays get the standard weekend-observed shift (Sat -> Fri, Sun -> Mon).
 *
 * All wall-clock math happens in America/New_York via Intl, so this is
 * correct across the EST/EDT boundary without manual UTC-offset tracking.
 */

export type MarketStatus = {
  isOpen: boolean;
  /** Short label for the badge, e.g. "OPEN", "CLOSED" */
  label: string;
  /** Longer human reason, used as the tooltip */
  reason: string;
  /** True if today has a 1:00pm ET close (day before July 4th, day after
   *  Thanksgiving, Christmas Eve) */
  closesEarly: boolean;
  /** Only set when isOpen is false */
  nextOpenLabel: string | null;
};

type EasternParts = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number;
  weekday: number; // 0 = Sunday .. 6 = Saturday
};

function getEasternParts(date: Date): EasternParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) parts[p.type] = p.value;

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);

  // Weekday of a calendar date doesn't depend on timezone, so this is safe
  // to compute from the Y/M/D alone via a UTC-anchored date.
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return { year, month, day, hour: Number(parts.hour), minute: Number(parts.minute), weekday };
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Shifts a fixed holiday off weekends: Saturday -> preceding Friday, Sunday -> following Monday. */
function observed(year: number, month: number, day: number): { month: number; day: number } {
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const d = new Date(Date.UTC(year, month - 1, day));
  if (weekday === 6) d.setUTCDate(d.getUTCDate() - 1);
  if (weekday === 0) d.setUTCDate(d.getUTCDate() + 1);
  return { month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** The nth occurrence (1-indexed) of a weekday in a given month. */
function nthWeekday(year: number, month: number, weekday: number, n: number): number {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (weekday - first + 7) % 7;
  return 1 + offset + (n - 1) * 7;
}

/** The last occurrence of a weekday in a given month. */
function lastWeekday(year: number, month: number, weekday: number): number {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = new Date(Date.UTC(year, month - 1, daysInMonth)).getUTCDay();
  const offset = (last - weekday + 7) % 7;
  return daysInMonth - offset;
}

/** Easter Sunday via the standard Anonymous Gregorian algorithm. */
function easterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

/** Full-day NYSE closures for a given year, keyed by ET calendar date. */
function nyseHolidays(year: number): Map<string, string> {
  const holidays = new Map<string, string>();
  const add = (month: number, day: number, name: string) => {
    holidays.set(dateKey(year, month, day), name);
  };

  const newYears = observed(year, 1, 1);
  add(newYears.month, newYears.day, "New Year's Day");

  add(1, nthWeekday(year, 1, 1, 3), "Martin Luther King Jr. Day");
  add(2, nthWeekday(year, 2, 1, 3), "Washington's Birthday");

  const easter = easterSunday(year);
  const goodFriday = new Date(Date.UTC(year, easter.month - 1, easter.day - 2));
  add(goodFriday.getUTCMonth() + 1, goodFriday.getUTCDate(), "Good Friday");

  add(5, lastWeekday(year, 5, 1), "Memorial Day");

  const juneteenth = observed(year, 6, 19);
  add(juneteenth.month, juneteenth.day, "Juneteenth");

  const independence = observed(year, 7, 4);
  add(independence.month, independence.day, "Independence Day");

  add(9, nthWeekday(year, 9, 1, 1), "Labor Day");
  add(11, nthWeekday(year, 11, 4, 4), "Thanksgiving Day");

  const christmas = observed(year, 12, 25);
  add(christmas.month, christmas.day, "Christmas Day");

  return holidays;
}

/**
 * 1:00pm ET closes. NYSE doesn't shift these onto another day when the
 * adjacent holiday lands on a weekend — they simply don't occur that year —
 * so each is only added when it falls on a weekday and isn't itself the
 * observed date of the neighboring full holiday.
 */
function nyseEarlyCloseDays(year: number): Set<string> {
  const days = new Set<string>();
  const holidays = nyseHolidays(year);
  const isWeekdayAndNotHoliday = (month: number, day: number) => {
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    return weekday >= 1 && weekday <= 5 && !holidays.has(dateKey(year, month, day));
  };

  if (isWeekdayAndNotHoliday(7, 3)) days.add(dateKey(year, 7, 3));

  const blackFriday = new Date(Date.UTC(year, 10, nthWeekday(year, 11, 4, 4)));
  blackFriday.setUTCDate(blackFriday.getUTCDate() + 1);
  days.add(dateKey(year, blackFriday.getUTCMonth() + 1, blackFriday.getUTCDate()));

  if (isWeekdayAndNotHoliday(12, 24)) days.add(dateKey(year, 12, 24));

  return days;
}

const OPEN_MINUTES = 9 * 60 + 30; // 9:30am
const CLOSE_MINUTES = 16 * 60; // 4:00pm
const EARLY_CLOSE_MINUTES = 13 * 60; // 1:00pm

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatClock(hour24: number, minute: number): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period} ET`;
}

export function getMarketStatus(now: Date = new Date()): MarketStatus {
  const et = getEasternParts(now);
  const key = dateKey(et.year, et.month, et.day);
  const holidayName = nyseHolidays(et.year).get(key);
  const closesEarly = nyseEarlyCloseDays(et.year).has(key);
  const minutesNow = et.hour * 60 + et.minute;
  const closeMinutes = closesEarly ? EARLY_CLOSE_MINUTES : CLOSE_MINUTES;
  const isWeekend = et.weekday === 0 || et.weekday === 6;

  const isTradingDay = !isWeekend && !holidayName;
  const isOpen = isTradingDay && minutesNow >= OPEN_MINUTES && minutesNow < closeMinutes;

  if (isOpen) {
    return {
      isOpen: true,
      label: "OPEN",
      reason: closesEarly
        ? `Closes early today at ${formatClock(13, 0)}`
        : "Regular trading hours",
      closesEarly,
      nextOpenLabel: null,
    };
  }

  let reason: string;
  if (holidayName) reason = `Closed — ${holidayName}`;
  else if (isWeekend) reason = "Weekend";
  else if (minutesNow < OPEN_MINUTES) reason = "Before regular hours";
  else reason = "After regular hours";

  // Walk forward to the next trading day. Start today if the market simply
  // hasn't opened yet today; otherwise start tomorrow. Ten days is well
  // beyond any real NYSE closure run (the longest is a 4-day weekend).
  const startToday = isTradingDay && minutesNow < OPEN_MINUTES;
  const cursor = new Date(Date.UTC(et.year, et.month - 1, et.day));
  if (!startToday) cursor.setUTCDate(cursor.getUTCDate() + 1);

  let nextOpenLabel: string | null = null;
  for (let i = 0; i < 10; i++) {
    const y = cursor.getUTCFullYear();
    const m = cursor.getUTCMonth() + 1;
    const d = cursor.getUTCDate();
    const weekday = cursor.getUTCDay();
    const holiday = nyseHolidays(y).get(dateKey(y, m, d));

    if (weekday !== 0 && weekday !== 6 && !holiday) {
      const dayLabel =
        i === 0 && startToday
          ? "today"
          : m === et.month && d === et.day + 1 && y === et.year
            ? "tomorrow"
            : WEEKDAY_SHORT[weekday];
      nextOpenLabel = `Opens ${dayLabel} at ${formatClock(9, 30)}`;
      break;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return { isOpen: false, label: "CLOSED", reason, closesEarly, nextOpenLabel };
}
