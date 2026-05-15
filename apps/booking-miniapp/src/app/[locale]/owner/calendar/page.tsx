'use client'

import { Badge, Button, Card, Skeleton } from '@doska/ui'
import { addDays, endOfDay, format, startOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  useCancelAppointment,
  useCompleteAppointment,
  useNoShowAppointment,
} from '@/hooks/mutations'
import { useAppointments } from '@/hooks/queries'
import { formatPrice, formatTime } from '@/lib/format'
import { useBookingStore } from '@/store/useBookingStore'

const DAY_RANGE = 14

export default function OwnerCalendar() {
  const router = useRouter()
  const params = useSearchParams()
  const focusId = params.get('focus')
  const { business } = useBookingStore()
  const currency = business?.settings?.currency || 'KZT'

  const today = new Date()
  const days = useMemo(
    () => Array.from({ length: DAY_RANGE }, (_, i) => addDays(today, i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const [day, setDay] = useState<Date>(today)

  const range = useMemo(
    () => ({
      from: startOfDay(day).toISOString(),
      to: endOfDay(day).toISOString(),
    }),
    [day],
  )
  const { data: apps, isLoading } = useAppointments(range)

  const completeMut = useCompleteAppointment()
  const cancelMut = useCancelAppointment()
  const noShowMut = useNoShowAppointment()

  const onComplete = async (id: number, total_price: string) => {
    const paid = prompt('Сумма оплаты (по умолчанию = цена услуги)', total_price)
    if (paid === null) return
    const method = prompt('Способ оплаты: cash / card / transfer', 'cash') || undefined
    try {
      await completeMut.mutateAsync({ id, body: { paid_amount: paid, payment_method: method } })
      toast.success('Запись закрыта, приход зафиксирован')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Не удалось закрыть')
    }
  }

  const onCancel = async (id: number) => {
    if (!confirm('Отменить запись?')) return
    const reason = prompt('Причина (необязательно)') || undefined
    try {
      await cancelMut.mutateAsync({ id, reason })
      toast.success('Запись отменена')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Не удалось отменить')
    }
  }

  const onNoShow = async (id: number) => {
    if (!confirm('Отметить как «не пришёл»?')) return
    try {
      await noShowMut.mutateAsync(id)
      toast.success('Отмечено')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-20">
      <button onClick={() => router.back()} className="text-sm text-muted-foreground mb-2">
        ← Назад
      </button>
      <h1 className="text-xl font-semibold mb-3">Календарь</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {days.map((d) => {
          const same = format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
          return (
            <button
              key={d.toISOString()}
              onClick={() => setDay(d)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg border text-center ${
                same ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <div className="text-xs text-muted-foreground">{format(d, 'EEE', { locale: ru })}</div>
              <div className="font-semibold">{format(d, 'd', { locale: ru })}</div>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <>
          <Skeleton className="h-24 w-full mb-2" />
          <Skeleton className="h-24 w-full" />
        </>
      ) : (apps?.length ?? 0) === 0 ? (
        <Card className="p-4 text-center text-sm text-muted-foreground">Записей нет.</Card>
      ) : (
        <div className="space-y-2">
          {(apps ?? []).map((ap) => {
            const highlighted = String(ap.id) === focusId
            const live = ['pending', 'confirmed'].includes(ap.status)
            return (
              <Card key={ap.id} className={`p-3 ${highlighted ? 'border-primary border-2' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <div className="font-medium">
                      {formatTime(ap.starts_at)} — {ap.client?.name ?? 'Клиент'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ap.services.map((s) => s.service?.name).filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <Badge variant={ap.status === 'confirmed' ? 'default' : 'secondary'}>
                    {ap.status}
                  </Badge>
                </div>
                {ap.client?.phone && (
                  <div className="text-xs text-muted-foreground">{ap.client.phone}</div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm font-semibold">{formatPrice(ap.total_price, currency)}</div>
                  {live && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" onClick={() => onComplete(ap.id, ap.total_price)}>
                        Закрыть
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onNoShow(ap.id)}>
                        Не пришёл
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onCancel(ap.id)}>
                        Отмена
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}
