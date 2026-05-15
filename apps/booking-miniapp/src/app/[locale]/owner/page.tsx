'use client'

import { Card, Skeleton } from '@doska/ui'
import { endOfWeek, startOfDay, startOfWeek, endOfDay } from 'date-fns'
import Link from 'next/link'
import { useMemo } from 'react'

import { useAppointments, useRevenue } from '@/hooks/queries'
import { formatDateTime, formatPrice } from '@/lib/format'
import { useBookingStore } from '@/store/useBookingStore'

export default function OwnerHome() {
  const { business } = useBookingStore()
  const currency = business?.settings?.currency || 'KZT'

  const todayRange = useMemo(() => {
    const now = new Date()
    return {
      from: startOfDay(now).toISOString(),
      to: endOfDay(now).toISOString(),
    }
  }, [])
  const weekRange = useMemo(() => {
    const now = new Date()
    return {
      from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      to: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
    }
  }, [])

  const { data: todayApps, isLoading: appsLoading } = useAppointments(todayRange)
  const { data: weekRevenue, isLoading: revLoading } = useRevenue({ ...weekRange, group_by: 'day' })

  const activeToday = (todayApps ?? []).filter((a) => ['pending', 'confirmed'].includes(a.status))

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold">{business?.company.name ?? 'Кабинет'}</h1>
      <p className="text-sm text-muted-foreground mb-4">Сегодня</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground mb-1">Записей сегодня</div>
          {appsLoading ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <div className="text-2xl font-bold">{activeToday.length}</div>
          )}
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground mb-1">Выручка за неделю</div>
          {revLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {formatPrice(weekRevenue?.total ?? 0, currency)}
            </div>
          )}
        </Card>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold">Сегодняшние записи</h2>
        <Link href="/owner/calendar" className="text-sm text-primary">
          Все →
        </Link>
      </div>

      {appsLoading ? (
        <>
          <Skeleton className="h-20 w-full mb-2" />
          <Skeleton className="h-20 w-full" />
        </>
      ) : activeToday.length === 0 ? (
        <Card className="p-4 text-center text-sm text-muted-foreground">
          На сегодня записей нет.
        </Card>
      ) : (
        <div className="space-y-2">
          {activeToday.map((ap) => (
            <Link key={ap.id} href={`/owner/calendar?focus=${ap.id}`}>
              <Card className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{ap.client?.name ?? 'Клиент'}</div>
                    <div className="text-xs text-muted-foreground">
                      {ap.services.map((s) => s.service?.name).filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <div className="text-sm">{formatDateTime(ap.starts_at).split(', ')[1] ?? ''}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Link href="/owner/calendar">
          <Card className="p-3 text-center text-sm font-medium">Календарь</Card>
        </Link>
        <Link href="/owner/finance">
          <Card className="p-3 text-center text-sm font-medium">Финансы</Card>
        </Link>
      </div>
    </main>
  )
}
