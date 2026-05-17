import { differenceInCalendarDays, endOfDay, format, parseISO, startOfDay } from 'date-fns'

import type {
  BookingScheduleItem,
  BookingScheduleOverride,
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
  /** True when the day's classification comes from a per-date override row. */
  isOverride?: boolean
}

const trimTime = (t: string | null | undefined) => (t ? t.slice(0, 5) : '')

/**
 * Decide the classification of a calendar day given the current schedule
 * draft, full-day time-off entries, rotation pattern, and per-date overrides.
 *
 * Override precedence: per-date override → time-off → rotation → weekday template.
 */
export function classifyDay(
  date: Date,
  items: BookingScheduleItem[] | undefined,
  timeOffs: BookingTimeOff[] | undefined,
  pattern: SchedulePattern | null | undefined,
  overrides?: BookingScheduleOverride[],
): DayMeta {
  const isoDate = format(date, 'yyyy-MM-dd')
  const override = overrides?.find((o) => o.override_date === isoDate)
  if (override) {
    if (!override.is_working_day) return { kind: 'off', isOverride: true }
    const hours = override.start_time && override.end_time
      ? { start: trimTime(override.start_time), end: trimTime(override.end_time) }
      : null
    return { kind: 'working', hours, isOverride: true }
  }

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
