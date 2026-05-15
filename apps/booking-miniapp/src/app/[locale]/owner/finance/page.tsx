'use client'

import { Button, Card, Skeleton } from '@doska/ui'
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek, subDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { useRevenue } from '@/hooks/queries'
import { formatPrice } from '@/lib/format'
import { useBookingStore } from '@/store/useBookingStore'

type Period = 'today' | 'week' | 'month' | '30d'

function range(period: Period) {
  const now = new Date()
  switch (period) {
    case 'today':
      return { from: new Date(now.setHours(0, 0, 0, 0)).toISOString(), to: new Date().toISOString() }
    case 'week':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        to: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      }
    case 'month':
      return { from: startOfMonth(now).toISOString(), to: endOfMonth(now).toISOString() }
    case '30d':
      return { from: subDays(now, 30).toISOString(), to: now.toISOString() }
  }
}

export default function FinancePage() {
  const router = useRouter()
  const { business } = useBookingStore()
  const currency = business?.settings?.currency || 'KZT'
  const [period, setPeriod] = useState<Period>('week')
  const [groupBy, setGroupBy] = useState<'day' | 'service' | 'client'>('day')

  const params = useMemo(() => ({ ...range(period), group_by: groupBy }), [period, groupBy])
  const { data, isLoading } = useRevenue(params)

  return (
    <main className="mx-auto max-w-md p-4">
      <button onClick={() => router.back()} className="text-sm text-muted-foreground mb-2">
        ← Назад
      </button>
      <h1 className="text-xl font-semibold mb-3">Финансы</h1>

      <div className="flex gap-2 mb-3">
        {(['today', 'week', 'month', '30d'] as Period[]).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={period === p ? 'default' : 'outline'}
            onClick={() => setPeriod(p)}
          >
            {p === 'today' ? 'День' : p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : '30 дн'}
          </Button>
        ))}
      </div>

      <Card className="p-4 mb-4">
        <div className="text-xs text-muted-foreground">Выручка</div>
        {isLoading ? (
          <Skeleton className="h-8 w-32 mt-1" />
        ) : (
          <div className="text-3xl font-bold">{formatPrice(data?.total ?? 0, currency)}</div>
        )}
        <div className="text-xs text-muted-foreground mt-1">{data?.count ?? 0} операций</div>
      </Card>

      <div className="flex gap-2 mb-2">
        {(['day', 'service', 'client'] as const).map((g) => (
          <Button
            key={g}
            size="sm"
            variant={groupBy === g ? 'default' : 'outline'}
            onClick={() => setGroupBy(g)}
          >
            {g === 'day' ? 'По дням' : g === 'service' ? 'По услугам' : 'По клиентам'}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (data?.breakdown?.length ?? 0) === 0 ? (
        <Card className="p-4 text-center text-sm text-muted-foreground">
          За этот период данных нет.
        </Card>
      ) : (
        <div className="space-y-1">
          {(data?.breakdown ?? []).map((row) => (
            <Card key={row.key} className="p-2 flex justify-between items-center">
              <div>
                <div className="text-sm font-medium">{row.label ?? row.key}</div>
                <div className="text-xs text-muted-foreground">{row.count} операций</div>
              </div>
              <div className="font-semibold">{formatPrice(row.amount, currency)}</div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
