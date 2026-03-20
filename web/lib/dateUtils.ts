/**
 * Parse a YYYY-MM-DD date string into a Date at noon local time.
 * Adding T12:00:00 avoids timezone-related off-by-one errors
 * that occur when parsing at midnight UTC.
 */
export function parseDateLocal(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00')
}
