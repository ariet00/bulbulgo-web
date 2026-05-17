'use client'

import {
  Button,
  Card,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Switch,
} from '@doska/ui'
import { useQuery } from '@tanstack/react-query'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { bookingApi } from '@/apis/booking'
import {
  useApplySchedulePreset,
  useDeleteScheduleOverride,
  useUpsertScheduleOverrides,
} from '@/hooks/mutations'
import {
  useEmployees,
  useSchedule,
  useScheduleOverrides,
  useSettings,
} from '@/hooks/queries'
import { classifyDay, toBackendWeekday } from '@/lib/scheduleClassify'
import { useBookingStore } from '@/store/useBookingStore'
import type { SchedulePattern, SchedulePatternType } from '@/types/booking'

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const PRESETS: { type: SchedulePatternType; label: string }[] = [
  { type: '5/2', label: 'Пн–Пт' },
  { type: '6/1', label: 'Пн–Сб' },
  { type: '7/0', label: 'Без выходных' },
  { type: '2/2', label: '2/2' },
  { type: '1/1', label: 'Через день' },
  { type: 'custom', label: 'Своё' },
]

const ROTATION_PRESETS = new Set<SchedulePatternType>(['2/2', '1/1', '3/3'])

const trimTime = (t: string | null | undefined) => (t ? t.slice(0, 5) : '')

export default function OwnerSchedule() {
  const { business } = useBookingStore()
  const isLegal = business?.company?.legal_form === 'legal'
  const { data: employees } = useEmployees()

  const [targetUserId, setTargetUserId] = useState<number | null>(null)
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [hoursOpen, setHoursOpen] = useState(false)
  const [presetsOpen, setPresetsOpen] = useState(false)

  const [formIsWorking, setFormIsWorking] = useState(true)
  const [formStart, setFormStart] = useState('09:00')
  const [formEnd, setFormEnd] = useState('20:00')

  const fetchRange = useMemo(() => {
    const from = startOfMonth(addMonths(monthCursor, -1))
    const to = endOfMonth(addMonths(monthCursor, 1))
    return {
      from: format(from, 'yyyy-MM-dd'),
      to: format(to, 'yyyy-MM-dd'),
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
    }
  }, [monthCursor])

  const { data: scheduleItems } = useSchedule(targetUserId)
  const { data: settings } = useSettings()
  const { data: overrides } = useScheduleOverrides({
    from: fetchRange.from,
    to: fetchRange.to,
    userId: targetUserId,
  })
  const { data: timeOffs } = useQuery({
    queryKey: ['booking', 'time-off', fetchRange.fromIso, fetchRange.toIso],
    queryFn: () => bookingApi.listTimeOff({ from: fetchRange.fromIso, to: fetchRange.toIso }),
  })

  const upsertOverrides = useUpsertScheduleOverrides()
  const deleteOverride = useDeleteScheduleOverride()
  const applyPreset = useApplySchedulePreset()

  const pattern: SchedulePattern | null = useMemo(() => {
    const t = settings?.schedule_pattern?.type
    if (t && ROTATION_PRESETS.has(t)) {
      return { type: t, anchor_date: settings?.schedule_pattern?.anchor_date ?? null }
    }
    return null
  }, [settings])

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [monthCursor])

  const toggleDay = (date: Date) => {
    const iso = format(date, 'yyyy-MM-dd')
    setSelectedDates((prev) => {
      const next = new Set(prev)
      if (next.has(iso)) next.delete(iso)
      else next.add(iso)
      return next
    })
  }

  const toggleWeekdayColumn = (weekdayIdx: number) => {
    setSelectedDates((prev) => {
      const next = new Set(prev)
      const weekdayDates = gridDays.filter(
        (d) => isSameMonth(d, monthCursor) && toBackendWeekday(d) === weekdayIdx,
      )
      const allSelected = weekdayDates.every((d) => next.has(format(d, 'yyyy-MM-dd')))
      for (const d of weekdayDates) {
        const iso = format(d, 'yyyy-MM-dd')
        if (allSelected) next.delete(iso)
        else next.add(iso)
      }
      return next
    })
  }

  const clearSelection = () => setSelectedDates(new Set())

  const openHoursSheet = () => {
    const firstIso = Array.from(selectedDates)[0]
    if (firstIso) {
      const ov = overrides?.find((o) => o.override_date === firstIso)
      if (ov) {
        setFormIsWorking(ov.is_working_day)
        setFormStart(ov.start_time ? trimTime(ov.start_time) : '09:00')
        setFormEnd(ov.end_time ? trimTime(ov.end_time) : '20:00')
      } else {
        const date = parseISO(firstIso)
        const wd = toBackendWeekday(date)
        const row = scheduleItems?.find((s) => s.weekday === wd)
        if (row) {
          setFormIsWorking(row.is_working_day)
          setFormStart(row.start_time ? trimTime(row.start_time) : '09:00')
          setFormEnd(row.end_time ? trimTime(row.end_time) : '20:00')
        }
      }
    }
    setHoursOpen(true)
  }

  const applyHours = async () => {
    if (selectedDates.size === 0) return
    try {
      await upsertOverrides.mutateAsync({
        items: Array.from(selectedDates).map((iso) => ({
          override_date: iso,
          start_time: formIsWorking ? `${formStart}:00` : null,
          end_time: formIsWorking ? `${formEnd}:00` : null,
          is_working_day: formIsWorking,
        })),
        user_id: targetUserId,
      })
      toast.success(`Сохранено для ${selectedDates.size} дат`)
      setHoursOpen(false)
      clearSelection()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  const quickNonWorking = async () => {
    if (selectedDates.size === 0) return
    try {
      await upsertOverrides.mutateAsync({
        items: Array.from(selectedDates).map((iso) => ({
          override_date: iso,
          start_time: null,
          end_time: null,
          is_working_day: false,
        })),
        user_id: targetUserId,
      })
      toast.success(`${selectedDates.size} дат помечены нерабочими`)
      clearSelection()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  const resetToTemplate = async () => {
    if (selectedDates.size === 0) return
    try {
      await Promise.all(
        Array.from(selectedDates).map(async (iso) => {
          try {
            await deleteOverride.mutateAsync({ date: iso, user_id: targetUserId })
          } catch (err: any) {
            if (err?.response?.status !== 404) throw err
          }
        }),
      )
      toast.success('Сброшено к шаблону')
      setHoursOpen(false)
      clearSelection()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  const applyPresetClick = async (type: SchedulePatternType) => {
    try {
      if (ROTATION_PRESETS.has(type)) {
        await applyPreset.mutateAsync({
          type,
          start_time: `${formStart}:00`,
          end_time: `${formEnd}:00`,
          user_id: targetUserId,
        })
      } else {
        await applyPreset.mutateAsync({ type, user_id: targetUserId })
      }
      toast.success('Шаблон применён')
      setPresetsOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  const today = new Date()
  const hasSelection = selectedDates.size > 0
  const pendingBatch = upsertOverrides.isPending || deleteOverride.isPending

  return (
    <main className="mx-auto max-w-md p-4 pb-32">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Расписание</h1>
        <Button variant="ghost" size="sm" onClick={() => setPresetsOpen(true)}>
          <MoreVertical className="size-4" />
        </Button>
      </div>

      {isLegal && (
        <Card className="p-3 mb-3">
          <Label className="text-xs uppercase text-muted-foreground mb-1 block">
            Чьё расписание
          </Label>
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
        </Card>
      )}

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
          {WEEKDAY_LABELS.map((l, idx) => (
            <button
              key={l}
              type="button"
              onClick={() => toggleWeekdayColumn(idx)}
              className="py-1 hover:text-primary"
            >
              {l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {gridDays.map((d) => {
            const inMonth = isSameMonth(d, monthCursor)
            const iso = format(d, 'yyyy-MM-dd')
            const meta = classifyDay(d, scheduleItems, timeOffs, pattern, overrides)
            const isToday = isSameDay(d, today)
            const isSelected = selectedDates.has(iso)
            const baseStyle = isSelected
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : meta.kind === 'timeoff'
                ? 'bg-amber-100 text-amber-800'
                : meta.kind === 'off'
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-emerald-50 text-emerald-900'
            return (
              <button
                key={iso}
                type="button"
                onClick={() => toggleDay(d)}
                className={`aspect-square rounded-md flex flex-col items-center justify-center p-1 relative text-xs ${baseStyle} ${inMonth ? '' : 'opacity-40'} ${isToday && !isSelected ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="font-medium leading-tight">{format(d, 'd')}</div>
                {meta.kind === 'working' && meta.hours && (
                  <div className="text-[9px] leading-tight opacity-75">
                    {meta.hours.start.slice(0, 2)}–{meta.hours.end.slice(0, 2)}
                  </div>
                )}
                {meta.kind === 'off' && (
                  <div className="text-[9px] leading-tight opacity-75">вых.</div>
                )}
                {meta.isOverride && (
                  <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-blue-500" />
                )}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-blue-500" /> по дате
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-emerald-50 border border-emerald-200" /> рабочий
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-muted border" /> выходной
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-amber-100 border border-amber-300" /> исключение
          </span>
        </div>
      </Card>

      {hasSelection && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-4">
          <div className="mx-auto max-w-md">
            <Card className="p-3 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  Выбрано: <b>{selectedDates.size}</b>{' '}
                  {selectedDates.size === 1 ? 'дата' : 'дат'}
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-muted-foreground text-xs"
                >
                  Очистить
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={openHoursSheet} disabled={pendingBatch}>
                  Настроить часы
                </Button>
                <Button onClick={quickNonWorking} variant="outline" disabled={pendingBatch}>
                  Нерабочий
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Sheet open={hoursOpen} onOpenChange={setHoursOpen}>
        <SheetContent side="bottom" className="max-h-[70vh]">
          <SheetHeader>
            <SheetTitle>Часы работы</SheetTitle>
          </SheetHeader>
          <div className="px-4 py-4 space-y-4">
            <div className="text-sm text-muted-foreground">
              Применить к {selectedDates.size}{' '}
              {selectedDates.size === 1 ? 'дате' : 'датам'}
            </div>
            <div className="flex items-center justify-between">
              <Label>Рабочий день</Label>
              <Switch checked={formIsWorking} onCheckedChange={setFormIsWorking} />
            </div>
            {formIsWorking && (
              <div className="grid grid-cols-2 gap-2 items-end">
                <div>
                  <Label className="text-xs">Начало</Label>
                  <Input
                    type="time"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Конец</Label>
                  <Input
                    type="time"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                  />
                </div>
              </div>
            )}
            <Button className="w-full" onClick={applyHours} disabled={pendingBatch}>
              Применить
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={resetToTemplate}
              disabled={pendingBatch}
            >
              Сбросить к шаблону недели
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={presetsOpen} onOpenChange={setPresetsOpen}>
        <SheetContent side="bottom" className="max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>Шаблон недели</SheetTitle>
          </SheetHeader>
          <div className="px-4 py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Шаблон задаёт часы по дням недели. Переопределения на конкретные даты сохраняются.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.type}
                  variant={
                    settings?.schedule_pattern?.type === p.type ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => applyPresetClick(p.type)}
                  className="text-xs"
                  disabled={applyPreset.isPending}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 items-end">
              <div>
                <Label className="text-xs">Начало (для цикла)</Label>
                <Input
                  type="time"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Конец (для цикла)</Label>
                <Input
                  type="time"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                />
              </div>
            </div>
            <Link href="/owner/schedule/time-off" className="block text-sm text-primary">
              Исключения и отпуска →
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
