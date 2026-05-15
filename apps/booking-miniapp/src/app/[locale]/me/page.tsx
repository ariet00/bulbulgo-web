'use client'

import { Badge, Button, Card, Skeleton } from '@doska/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { useAppointments } from '@/hooks/queries'
import { useCancelAppointment } from '@/hooks/mutations'
import { formatDateTime, formatPrice } from '@/lib/format'
import { useBookingStore } from '@/store/useBookingStore'

const statusLabel: Record<string, string> = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтверждено',
  completed: 'Завершено',
  cancelled: 'Отменено',
  no_show: 'Не пришёл',
}

export default function MyAppointmentsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const highlight = params.get('highlight')
  const { business } = useBookingStore()
  const currency = business?.settings?.currency || 'KZT'

  const { data: appointments, isLoading } = useAppointments()
  const cancelMut = useCancelAppointment()

  const cancel = async (id: number) => {
    if (!confirm('Отменить эту запись?')) return
    try {
      await cancelMut.mutateAsync({ id })
      toast.success('Запись отменена')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Не удалось отменить')
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold mb-3">Мои записи</h1>

      {isLoading ? (
        <>
          <Skeleton className="h-24 w-full mb-2" />
          <Skeleton className="h-24 w-full" />
        </>
      ) : (appointments?.length ?? 0) === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">У вас пока нет записей.</p>
          <Button onClick={() => router.push('/book')}>Записаться</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {(appointments ?? []).map((ap) => {
            const isHighlighted = String(ap.id) === highlight
            const canCancel = ['pending', 'confirmed'].includes(ap.status)
            const services = ap.services.map((s) => s.service?.name).filter(Boolean).join(', ')
            return (
              <Card key={ap.id} className={`p-3 ${isHighlighted ? 'border-primary border-2' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">{services || 'Услуга'}</div>
                  <Badge variant={ap.status === 'confirmed' ? 'default' : 'secondary'}>
                    {statusLabel[ap.status] ?? ap.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">{formatDateTime(ap.starts_at)}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm font-semibold">{formatPrice(ap.total_price, currency)}</div>
                  {canCancel && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancel(ap.id)}
                      disabled={cancelMut.isPending}
                    >
                      Отменить
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => router.push('/book')}>
          Записаться ещё
        </Button>
      </div>
    </main>
  )
}
