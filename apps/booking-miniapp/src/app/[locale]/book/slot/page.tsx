'use client'

import { Button, Card, Skeleton } from '@doska/ui'
import { addDays, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useAvailability, useServices } from '@/hooks/queries'
import { useCreateAppointment } from '@/hooks/mutations'
import { formatDuration, formatPrice, formatTime } from '@/lib/format'
import { useBookingStore } from '@/store/useBookingStore'

const DAY_PICKER_LEN = 14

export default function SlotPage() {
  const router = useRouter()
  const params = useSearchParams()
  const serviceIds = useMemo(
    () => params.getAll('service_ids').map((s) => parseInt(s, 10)).filter(Boolean),
    [params],
  )
  const staffIdParam = params.get('staff_id')
  const staffId = staffIdParam ? parseInt(staffIdParam, 10) : null

  const { business } = useBookingStore()
  const currency = business?.settings?.currency || 'KZT'

  const { data: services } = useServices()
  const selectedServices = (services || []).filter((s) => serviceIds.includes(s.id))
  const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0)
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_min, 0)

  const horizon = business?.settings?.max_horizon_days ?? 30
  const days = useMemo(() => {
    const today = new Date()
    const upper = Math.min(DAY_PICKER_LEN, horizon)
    return Array.from({ length: upper }, (_, i) => addDays(today, i))
  }, [horizon])

  const [pickedDay, setPickedDay] = useState<Date>(days[0])
  const isoDate = format(pickedDay, 'yyyy-MM-dd')

  const { data: slots, isLoading: slotsLoading } = useAvailability({
    date: isoDate,
    service_ids: serviceIds,
    staff_id: staffId,
  })

  const createAppt = useCreateAppointment()

  const onPick = async (startIso: string) => {
    try {
      const ap = await createAppt.mutateAsync({
        starts_at: startIso,
        service_ids: serviceIds,
        staff_id: staffId,
      })
      toast.success('Запись создана')
      router.replace(`/me?highlight=${ap.id}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Не удалось создать запись')
    }
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-32">
      <button onClick={() => router.back()} className="text-sm text-muted-foreground mb-2">
        ← Назад
      </button>
      <h1 className="text-xl font-semibold mb-1">Выберите время</h1>
      <p className="text-sm text-muted-foreground mb-4">
        {selectedServices.map((s) => s.name).join(', ')} · {formatDuration(totalDuration)} ·{' '}
        {formatPrice(totalPrice, currency)}
      </p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {days.map((d) => {
          const same = format(d, 'yyyy-MM-dd') === format(pickedDay, 'yyyy-MM-dd')
          return (
            <button
              key={d.toISOString()}
              onClick={() => setPickedDay(d)}
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

      {slotsLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (slots?.length ?? 0) === 0 ? (
        <Card className="p-4 text-center text-sm text-muted-foreground">
          Свободных слотов нет — попробуйте другой день.
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {(slots ?? []).map((slot) => (
            <Button
              key={slot.start}
              variant="outline"
              disabled={createAppt.isPending}
              onClick={() => onPick(slot.start)}
            >
              {formatTime(slot.start)}
            </Button>
          ))}
        </div>
      )}
    </main>
  )
}
