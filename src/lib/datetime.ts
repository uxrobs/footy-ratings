export const AFL_TIMEZONE = "Australia/Melbourne";

/** Squiggle `localtime` is "YYYY-MM-DD HH:MM:SS" in AFL local time (no offset). */
export function parseSquiggleKickoff(raw: string): string {
  const match = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    return raw;
  }

  const [, year, month, day, hour, minute, second] = match.map(Number) as [
    unknown,
    number,
    number,
    number,
    number,
    number,
    number,
  ];

  return zonedLocalTimeToUtc(
    year,
    month,
    day,
    hour,
    minute,
    second,
    AFL_TIMEZONE,
  ).toISOString();
}

function zonedLocalTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  let utcMs = Date.UTC(year, month - 1, day, hour, minute, second);

  for (let i = 0; i < 2; i++) {
    const offsetMs = getTimeZoneOffsetMs(timeZone, new Date(utcMs));
    utcMs = Date.UTC(year, month - 1, day, hour, minute, second) - offsetMs;
  }

  return new Date(utcMs);
}

function getTimeZoneOffsetMs(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  const asUtc = Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second"),
  );

  return asUtc - date.getTime();
}

const kickoffDateFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: AFL_TIMEZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const kickoffTimeFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: AFL_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
});

export function formatGameKickoff(kickoffAt: string, includeTime: boolean): string {
  const date = new Date(kickoffAt);
  const datePart = kickoffDateFormatter.format(date);

  if (!includeTime) {
    return datePart;
  }

  return `${datePart}, ${kickoffTimeFormatter.format(date)}`;
}
