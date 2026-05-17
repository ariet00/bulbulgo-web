'use client'

import { Button, Card, Input, Skeleton, Switch } from '@doska/ui'
import { useQuery } from '@tanstack/react-query'
import {
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { bookingApi } from '@/apis/booking'
import { useReplaceSchedule } from '@/hooks/mutations'
import { useSchedule } from '@/hooks/queries'
import type { BookingScheduleItem, BookingTimeOff } from '@/types/booking'

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function defaultItems(): BookingScheduleItem[] {
  return Array.from({ length: 7 }, (_, i) => ({
    weekday: i,
    start_time: '09:00:00',
    end_time: '20:00:00',
    is_working_day: i < 6,
  }))
}

function timeToInput(t: string | null | undefined): string {
  if (!t) return ''
  return t.slice(0, 5)
}

function inputToTime(v: string): string | null {
  if (!v) return null
  return v.length === 5 ? `${v}:00` : v
}

/** JS Date.getDay() returns 0=Sun..6=Sat; backend uses 0=Mon..6=Sun. */
const toBackendWeekday = (d: Date) => (d.getDay() + 6) % 7

type DayClass = 'working' | 'off' | 'timeoff'

function classifyDay(
  date: Date,
  items: BookingScheduleItem[],
  timeOffs: BookingTimeOff[] | undefined,
): { kind: DayClass; reason?: string | null } {
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)
  const fullDayOff = timeOffs?.find((t) => {
    const ts = new Date(t.starts_at)
    const te = new Date(t.ends_at)
    return ts <= dayStart && te >= dayEnd
  })
  if (fullDayOff) return { kind: 'timeoff', reason: fullDayOff.reason }
  const row = items.find((s) => s.weekday === toBackendWeekday(date))
  if (!row || !row.is_working_day) return { kind: 'off' }
  return { kind: 'working' }
}

function SchedulePreview({
  items,
  timeOffs,
}: {
  items: BookingScheduleItem[]
  timeOffs: BookingTimeOff[] | undefined
}) {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const today = new Date()

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [monthCursor])

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="px-2"
          onClick={() => setMonthCursor((d) => addMonths(d, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="font-medium text-sm capitalize">
          {format(monthCursor, 'LLLL yyyy', { locale: ru })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="px-2"
          onClick={() => setMonthCursor((d) => addMonths(d, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1 text-center text-[10px] text-muted-foreground uppercase">
        {WEEKDAY_LABELS.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {gridDays.map((d) => {
          const inMonth = isSameMonth(d, monthCursor)
          const meta = classifyDay(d, items, timeOffs)
          const isToday = isSameDay(d, today)
          const base = 'aspect-square rounded-md flex items-center justify-center text-xs relative'
          const muted = inMonth ? '' : 'opacity-40'
          const styling =
            meta.kind === 'timeoff'
              ? 'bg-amber-100 text-amber-800'
              : meta.kind === 'off'
                ? 'bg-muted text-muted-foreground line-through decoration-1'
                : 'bg-emerald-50 text-emerald-900'
          const todayRing = isToday ? 'ring-2 ring-primary' : ''
          return (
            <div
              key={d.toISOString()}
              className={`${base} ${styling} ${muted} ${todayRing}`}
              title={
                meta.kind === 'timeoff'
                  ? `Исключение${meta.reason ? `: ${meta.reason}` : ''}`
                  : meta.kind === 'off'
                    ? 'Выходной'
                    : 'Рабочий день'
              }
            >
              {format(d, 'd')}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-sm bg-emerald-50 border border-emerald-200" /> рабочий
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-sm bg-muted border" /> выходной
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-sm bg-amber-100 border border-amber-300" /> исключение
        </span>
      </div>
    </Card>
  )
}

export default function OwnerSchedule() {
  const { data, isLoading } = useSchedule()
  const replace = useReplaceSchedule()
  const [items, setItems] = useState<BookingScheduleItem[]>(defaultItems())

  useEffect(() => {
    if (data && data.length === 7) {
      setItems(
        [...data]
          .sort((a, b) => a.weekday - b.weekday)
          .map((d) => ({
            weekday: d.weekday,
            start_time: d.start_time,
            end_time: d.end_time,
            is_working_day: d.is_working_day,
          })),
      )
    }
  }, [data])

  // Pull time-off spanning current + next 2 months so the preview can scroll a bit forward.
  const timeOffRange = useMemo(() => {
    const from = startOfMonth(new Date())
    const to = endOfMonth(addMonths(from, 2))
    return { from: from.toISOString(), to: to.toISOString() }
  }, [])
  const { data: timeOffs } = useQuery({
    queryKey: ['booking', 'time-off', timeOffRange],
    queryFn: () => bookingApi.listTimeOff(timeOffRange),
  })

  const updateRow = (i: number, patch: Partial<BookingScheduleItem>) => {
    setItems((prev) => prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  }

  const save = async () => {
    try {
      await replace.mutateAsync(items)
      toast.success('Расписание сохранено')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  return (
    <main className="mx-auto max-w-md p-4 space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Расписание</h1>
        <p className="text-sm text-muted-foreground">
          Рабочие часы по дням недели.{' '}
          <Link href="/owner/schedule/time-off" className="text-primary">
            Исключения →
          </Link>
        </p>
      </div>

      <SchedulePreview items={items} timeOffs={timeOffs} />

      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <Card className="p-3 space-y-2">
          {items.map((row, i) => (
            <div key={row.weekday} className="flex items-center gap-2">
              <div className="w-8 text-sm font-medium">{WEEKDAY_LABELS[row.weekday]}</div>
              <Switch
                checked={row.is_working_day}
                onCheckedChange={(v) => updateRow(i, { is_working_day: v })}
              />
              <Input
                type="time"
                value={timeToInput(row.start_time)}
                disabled={!row.is_working_day}
                onChange={(e) => updateRow(i, { start_time: inputToTime(e.target.value) })}
                className="flex-1"
              />
              <span className="text-muted-foreground">—</span>
              <Input
                type="time"
                value={timeToInput(row.end_time)}
                disabled={!row.is_working_day}
                onChange={(e) => updateRow(i, { end_time: inputToTime(e.target.value) })}
                className="flex-1"
              />
            </div>
          ))}
        </Card>
      )}

      <Button className="w-full" onClick={save} disabled={replace.isPending}>
        Сохранить
      </Button>
    </main>
  )
}
