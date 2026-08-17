// The academic session runs February -> February of the next year.
const SESSION_START_MONTH = 1; // February (0-indexed)

export function getToday() {
  return new Date();
}

export function getSessionStartYear(date: Date = new Date()) {
  return date.getMonth() >= SESSION_START_MONTH ? date.getFullYear() : date.getFullYear() - 1;
}

export function getCurrentSessionLabel(date: Date = new Date()) {
  const startYear = getSessionStartYear(date);
  return `${startYear}–${startYear + 1}`;
}

export function getCurrentSessionRange(date: Date = new Date()) {
  const startYear = getSessionStartYear(date);
  return `February ${startYear} – February ${startYear + 1}`;
}

export function formatLongDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function getSessionMonths(date: Date = new Date()) {
  const startYear = getSessionStartYear(date);
  const months: { label: string; value: string }[] = [];
  for (let i = 0; i < 13; i++) {
    const monthIndex = (SESSION_START_MONTH + i) % 12;
    const year = startYear + Math.floor((SESSION_START_MONTH + i) / 12);
    months.push({ label: `${MONTH_NAMES[monthIndex]} ${year}`, value: `${MONTH_NAMES[monthIndex].toLowerCase()}-${year}` });
  }
  return months;
}

export function getCurrentMonthValue(date: Date = new Date()) {
  return `${MONTH_NAMES[date.getMonth()].toLowerCase()}-${date.getFullYear()}`;
}

export function monthValueToDate(value: string): Date {
  const [monthName, year] = value.split("-");
  const monthIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase() === monthName);
  return new Date(Number(year), monthIndex, 1);
}

export function dateToMonthValue(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()].toLowerCase()}-${date.getFullYear()}`;
}

export function monthValueToISODate(value: string): string {
  const date = monthValueToDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}
