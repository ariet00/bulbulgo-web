'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { staffApi } from '@/apis/staff'
import type { LeaveType } from '@/types/staff'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function colorFor(type: LeaveType) {
  return {
    vacation: 'bg-green-200 text-green-900',
    sick: 'bg-amber-200 text-amber-900',
    unpaid: 'bg-gray-200 text-gray-700',
    other: 'bg-blue-200 text-blue-900',
  }[type]
}

export default function LeaveCalendarPage() {
  const t = useTranslations('leaves')
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const calendarQuery = useQuery({
    queryKey: ['staff', 'leaves', 'calendar', year, month],
    queryFn: () => staffApi.leaveCalendar(year, month),
  })

  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month])
  const firstWeekday = useMemo(() => {
    const wd = new Date(year, month - 1, 1).getDay()
    return wd === 0 ? 6 : wd - 1
  }, [year, month])

  const entries = calendarQuery.data?.entries ?? []
  const byDay = useMemo(() => {
    const map = new Map<number, typeof entries>()
    for (const e of entries) {
      const start = new Date(e.starts_at)
      const end = new Date(e.ends_at)
      for (let d = 1; d <= daysInMonth; d++) {
        const cur = new Date(year, month - 1, d)
        if (cur >= start && cur <= end) {
          const arr = map.get(d) ?? []
          arr.push(e)
          map.set(d, arr)
        }
      }
    }
    return map
  }, [entries, year, month, daysInMonth])

  const shift = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
  }

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('calendarTitle')}</h1>
        <div className="flex items-center gap-2 text-sm">
          <button type="button" onClick={() => shift(-1)} className="rounded border px-2 py-1">‹</button>
          <span className="min-w-[6rem] text-center">{year}-{pad2(month)}</span>
          <button type="button" onClick={() => shift(1)} className="rounded border px-2 py-1">›</button>
        </div>
      </header>

      <div className="rounded-lg border bg-card p-2">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
          {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
            const dayEntries = byDay.get(d) ?? []
            return (
              <div key={d} className="h-16 rounded border bg-background p-1 text-xs overflow-hidden">
                <div className="text-right text-[10px] text-muted-foreground">{d}</div>
                <div className="mt-0.5 space-y-0.5">
                  {dayEntries.slice(0, 2).map((e) => (
                    <div
                      key={e.leave_id}
                      className={`truncate rounded px-1 text-[9px] ${colorFor(e.type)}`}
                      title={`${e.display_name} (${t(`type.${e.type}`)})`}
                    >
                      {e.display_name}
                    </div>
                  ))}
                  {dayEntries.length > 2 && (
                    <div className="text-[9px] text-muted-foreground">+{dayEntries.length - 2}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
