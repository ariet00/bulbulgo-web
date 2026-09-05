import { addHours, format, set, startOfMinute } from 'date-fns'

/** IANA zone of the browser; sent to the backend for display purposes. */
export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Bishkek'
  } catch {
    return 'Asia/Bishkek'
  }
}

/** Date → value for `<input type="datetime-local">` (local wall time). */
export function toLocalInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

/** `<input type="datetime-local">` value → Date in the browser zone, or null. */
export function fromLocalInputValue(value: string): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Quick picks offered in the schedule dialog. */
export function schedulePresets(now = new Date()): Array<{ label: string; at: Date }> {
  const inHour = startOfMinute(addHours(now, 1))
  const tomorrow = set(addHours(now, 24), { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 })
  const tomorrowEvening = set(tomorrow, { hours: 18 })
  return [
    { label: 'Через час', at: inHour },
    { label: 'Завтра в 10:00', at: tomorrow },
    { label: 'Завтра в 18:00', at: tomorrowEvening },
  ]
}
