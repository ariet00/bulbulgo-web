'use client'

import { Button, Card, Input, Skeleton, Switch } from '@doska/ui'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useReplaceSchedule } from '@/hooks/mutations'
import { useSchedule } from '@/hooks/queries'
import type { BookingScheduleItem } from '@/types/booking'

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
  return t.slice(0, 5) // "HH:MM"
}

function inputToTime(v: string): string | null {
  if (!v) return null
  return v.length === 5 ? `${v}:00` : v
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
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold mb-1">Расписание</h1>
      <p className="text-sm text-muted-foreground mb-3">
        Рабочие часы по дням недели.{' '}
        <Link href="/owner/schedule/time-off" className="text-primary">
          Исключения →
        </Link>
      </p>

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

      <Button className="w-full mt-3" onClick={save} disabled={replace.isPending}>
        Сохранить
      </Button>
    </main>
  )
}
