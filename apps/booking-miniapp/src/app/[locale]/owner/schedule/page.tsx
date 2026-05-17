'use client'

import { Button, Card, Input, Label, Skeleton, Switch } from '@doska/ui'
import { useQuery } from '@tanstack/react-query'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { bookingApi } from '@/apis/booking'
import { useApplySchedulePreset, useReplaceSchedule } from '@/hooks/mutations'
import { useEmployees, useSchedule, useSettings } from '@/hooks/queries'
import { classifyDay } from '@/lib/scheduleClassify'
import { useBookingStore } from '@/store/useBookingStore'
import type {
  BookingScheduleItem,
  BookingTimeOff,
  SchedulePattern,
  SchedulePatternType,
} from '@/types/booking'

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

type Preset = {
  type: SchedulePatternType
  label: string
  isRotation: boolean
}

const PRESETS: Preset[] = [
  { type: '5/2', label: 'Пн–Пт', isRotation: false },
  { type: '6/1', label: 'Пн–Сб', isRotation: false },
  { type: '7/0', label: 'Без выходных', isRotation: false },
  { type: '2/2', label: '2/2', isRotation: true },
  { type: '1/1', label: 'Через день', isRotation: true },
  { type: 'custom', label: 'Своё', isRotation: false },
]

function defaultItems(): BookingScheduleItem[] {
  return Array.from({ length: 7 }, (_, i) => ({
    weekday: i,
    start_time: '09:00:00',
    end_time: '20:00:00',
    is_working_day: i < 6,
  }))
}

function applyWeekdayPreset(
  type: SchedulePatternType,
  base: BookingScheduleItem[],
): BookingScheduleItem[] {
  const mask: boolean[] = (() => {
    if (type === '5/2') return [true, true, true, true, true, false, false]
    if (type === '6/1') return [true, true, true, true, true, true, false]
    if (type === '7/0') return [true, true, true, true, true, true, true]
    return base.map((r) => r.is_working_day)
  })()
  return base.map((row) => ({ ...row, is_working_day: mask[row.weekday] }))
}

const timeToInput = (t: string | null | undefined) => (t ? t.slice(0, 5) : '')
const inputToTime = (v: string) => (v ? (v.length === 5 ? `${v}:00` : v) : null)

function SchedulePreview({
  items,
  timeOffs,
  pattern,
}: {
  items: BookingScheduleItem[]
  timeOffs: BookingTimeOff[] | undefined
  pattern: SchedulePattern | null | undefined
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
        <Button variant="ghost" size="sm" className="px-2" onClick={() => setMonthCursor((d) => addMonths(d, -1))}>
          <ChevronLeft className="size-4" />
        </Button>
        <div className="font-medium text-sm capitalize">
          {format(monthCursor, 'LLLL yyyy', { locale: ru })}
        </div>
        <Button variant="ghost" size="sm" className="px-2" onClick={() => setMonthCursor((d) => addMonths(d, 1))}>
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
          const meta = classifyDay(d, items, timeOffs, pattern)
          const isToday = isSameDay(d, today)
          const styling =
            meta.kind === 'timeoff'
              ? 'bg-amber-100 text-amber-800'
              : meta.kind === 'off'
                ? 'bg-muted text-muted-foreground line-through decoration-1'
                : 'bg-emerald-50 text-emerald-900'
          return (
            <div
              key={d.toISOString()}
              className={`aspect-square rounded-md flex items-center justify-center text-xs relative ${styling} ${inMonth ? '' : 'opacity-40'} ${isToday ? 'ring-2 ring-primary' : ''}`}
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
  const { business } = useBookingStore()
  const isLegal = business?.company?.legal_form === 'legal'
  const { data: employees } = useEmployees()

  // null = company-wide schedule; number = per-staff override
  const [targetUserId, setTargetUserId] = useState<number | null>(null)
  const { data, isLoading } = useSchedule(targetUserId)
  const { data: settings } = useSettings()
  const replace = useReplaceSchedule()
  const preset = useApplySchedulePreset()
  const [items, setItems] = useState<BookingScheduleItem[]>(defaultItems())
  const [activePreset, setActivePreset] = useState<SchedulePatternType>('custom')

  const [rotationStart, setRotationStart] = useState('09:00')
  const [rotationEnd, setRotationEnd] = useState('20:00')

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
      const firstWorking = data.find((d) => d.start_time && d.end_time)
      if (firstWorking) {
        setRotationStart(timeToInput(firstWorking.start_time))
        setRotationEnd(timeToInput(firstWorking.end_time))
      }
    }
  }, [data])

  useEffect(() => {
    const t = settings?.schedule_pattern?.type
    if (t) setActivePreset(t)
  }, [settings])

  // Synthetic pattern reflecting the active preset for the live preview.
  const livePattern: SchedulePattern | null = useMemo(() => {
    if (activePreset === '2/2' || activePreset === '1/1' || activePreset === '3/3') {
      const anchor = settings?.schedule_pattern?.anchor_date ?? new Date().toISOString().slice(0, 10)
      return { type: activePreset, anchor_date: anchor }
    }
    return null
  }, [activePreset, settings])

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

  const onPresetClick = (p: Preset) => {
    setActivePreset(p.type)
    if (p.type === '5/2' || p.type === '6/1' || p.type === '7/0') {
      setItems((prev) => applyWeekdayPreset(p.type, prev))
    }
  }

  const isRotation = activePreset === '2/2' || activePreset === '1/1' || activePreset === '3/3'

  const save = async () => {
    try {
      if (isRotation) {
        await preset.mutateAsync({
          type: activePreset,
          start_time: rotationStart,
          end_time: rotationEnd,
          user_id: targetUserId,
        })
        toast.success('Расписание сохранено')
        return
      }
      await replace.mutateAsync({ items, user_id: targetUserId })
      await preset.mutateAsync({ type: activePreset, user_id: targetUserId })
      toast.success('Расписание сохранено')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  const pending = replace.isPending || preset.isPending

  return (
    <main className="mx-auto max-w-md p-4 space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Расписание</h1>
        <p className="text-sm text-muted-foreground">
          Выберите шаблон или настройте вручную.{' '}
          <Link href="/owner/schedule/time-off" className="text-primary">
            Исключения →
          </Link>
        </p>
      </div>

      {isLegal && (
        <Card className="p-3">
          <Label className="text-xs uppercase text-muted-foreground mb-1 block">Чьё расписание</Label>
          <select
            value={targetUserId == null ? 'company' : String(targetUserId)}
            onChange={(e) =>
              setTargetUserId(e.target.value === 'company' ? null : parseInt(e.target.value, 10))
            }
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="company">Общее (по умолчанию)</option>
            {(employees ?? []).map((emp) => (
              <option key={emp.user_id} value={emp.user_id}>
                {emp.display_name}
                {emp.is_owner ? ' (владелец)' : ''}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground mt-1">
            «Общее» используется как шаблон, если у сотрудника нет собственного расписания.
          </p>
        </Card>
      )}

      <Card className="p-3">
        <div className="text-xs uppercase text-muted-foreground mb-2">Шаблон</div>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.type}
              variant={activePreset === p.type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPresetClick(p)}
              className="text-xs"
            >
              {p.label}
            </Button>
          ))}
        </div>
        {isRotation && (
          <div className="mt-3 grid grid-cols-2 gap-2 items-end">
            <div>
              <label className="text-xs text-muted-foreground">Начало</label>
              <Input
                type="time"
                value={rotationStart}
                onChange={(e) => setRotationStart(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Конец</label>
              <Input
                type="time"
                value={rotationEnd}
                onChange={(e) => setRotationEnd(e.target.value)}
              />
            </div>
            <p className="col-span-2 text-[11px] text-muted-foreground">
              Цикл начинается сегодня ({format(new Date(), 'd MMMM', { locale: ru })}).
            </p>
          </div>
        )}
      </Card>

      <SchedulePreview items={items} timeOffs={timeOffs} pattern={livePattern} />

      {!isRotation && (
        isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <Card className="p-3 space-y-2">
            {items.map((row, i) => (
              <div key={row.weekday} className="flex items-center gap-2">
                <div className="w-8 text-sm font-medium">{WEEKDAY_LABELS[row.weekday]}</div>
                <Switch
                  checked={row.is_working_day}
                  onCheckedChange={(v) => {
                    updateRow(i, { is_working_day: v })
                    setActivePreset('custom')
                  }}
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
        )
      )}

      <Button className="w-full" onClick={save} disabled={pending}>
        Сохранить
      </Button>
    </main>
  )
}
