import { differenceInCalendarDays, endOfDay, parseISO, startOfDay } from 'date-fns'

import type {
  BookingScheduleItem,
  BookingTimeOff,
  SchedulePattern,
} from '@/types/booking'

const ROTATION_CYCLES: Record<string, [number, number]> = {
  '2/2': [2, 2],
  '1/1': [1, 1],
  '3/3': [3, 3],
}

/** JS Date.getDay() returns 0=Sun..6=Sat; backend uses 0=Mon..6=Sun. */
export const toBackendWeekday = (d: Date) => (d.getDay() + 6) % 7

/** Returns true/false if `pattern` is a rotation that decides the day, else null. */
export function rotationWorkingDay(
  pattern: SchedulePattern | null | undefined,
  date: Date,
): boolean | null {
  if (!pattern) return null
  const cycle = ROTATION_CYCLES[pattern.type]
  if (!cycle) return null
  if (!pattern.anchor_date) return null
  const anchor = parseISO(pattern.anchor_date)
  const diff = differenceInCalendarDays(date, anchor)
  if (diff < 0) return false
  const [on, off] = cycle
  return diff % (on + off) < on
}

export type DayKind = 'working' | 'off' | 'timeoff'

export type DayMeta = {
  kind: DayKind
  reason?: string | null
  hours?: { start: string; end: string } | null
}

const trimTime = (t: string | null | undefined) => (t ? t.slice(0, 5) : '')

/**
 * Decide the classification of a calendar day given the current schedule
 * draft, full-day time-off entries, and an optional rotation pattern.
 */
export function classifyDay(
  date: Date,
  items: BookingScheduleItem[] | undefined,
  timeOffs: BookingTimeOff[] | undefined,
  pattern: SchedulePattern | null | undefined,
): DayMeta {
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)
  const fullDayOff = timeOffs?.find((t) => {
    const ts = new Date(t.starts_at)
    const te = new Date(t.ends_at)
    return ts <= dayStart && te >= dayEnd
  })
  if (fullDayOff) return { kind: 'timeoff', reason: fullDayOff.reason }

  const row = items?.find((s) => s.weekday === toBackendWeekday(date))
  const hours = row?.start_time && row?.end_time
    ? { start: trimTime(row.start_time), end: trimTime(row.end_time) }
    : null

  const rot = rotationWorkingDay(pattern, date)
  if (rot === false) return { kind: 'off' }
  if (rot === true) return { kind: 'working', hours }

  // No rotation — fall back to weekday flag.
  if (!row || !row.is_working_day) return { kind: 'off' }
  return { kind: 'working', hours }
}
