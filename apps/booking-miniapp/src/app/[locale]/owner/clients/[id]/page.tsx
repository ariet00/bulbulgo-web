'use client'

import { Badge, Card, Skeleton } from '@doska/ui'
import { useQuery } from '@tanstack/react-query'
import { use } from 'react'
import { useRouter } from 'next/navigation'

import { bookingApi } from '@/apis/booking'
import { api } from '@/lib/api'
import { formatDateTime, formatPrice } from '@/lib/format'
import { useBookingStore } from '@/store/useBookingStore'
import type { Appointment, Client } from '@/types/booking'

export default function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const clientId = parseInt(id, 10)
  const router = useRouter()
  const { business } = useBookingStore()
  const currency = business?.settings?.currency || 'KZT'

  const clientQ = useQuery({
    queryKey: ['booking', 'client', clientId],
    queryFn: () => api.get<Client>(`/api/v1/booking/clients/${clientId}`).then((r) => r.data),
  })
  const appsQ = useQuery({
    queryKey: ['booking', 'client', clientId, 'appointments'],
    queryFn: () =>
      api
        .get<Appointment[]>(`/api/v1/booking/clients/${clientId}/appointments`)
        .then((r) => r.data),
  })

  if (clientQ.isLoading) {
    return (
      <main className="mx-auto max-w-md p-4">
        <Skeleton className="h-20 w-full mb-2" />
      </main>
    )
  }
  const c = clientQ.data
  if (!c) return null

  return (
    <main className="mx-auto max-w-md p-4">
      <button onClick={() => router.back()} className="text-sm text-muted-foreground mb-2">
        ← Назад
      </button>
      <h1 className="text-xl font-semibold">{c.name}</h1>
      {c.phone && <p className="text-sm text-muted-foreground">{c.phone}</p>}

      <div className="grid grid-cols-2 gap-2 my-4">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Визитов</div>
          <div className="text-xl font-bold">{c.visits_count}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Потрачено</div>
          <div className="text-xl font-bold">{formatPrice(c.total_spent, currency)}</div>
        </Card>
      </div>

      <h2 className="font-medium mb-2">История</h2>
      {appsQ.isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (appsQ.data?.length ?? 0) === 0 ? (
        <Card className="p-4 text-center text-sm text-muted-foreground">Записей нет.</Card>
      ) : (
        <div className="space-y-2">
          {(appsQ.data ?? []).map((ap) => (
            <Card key={ap.id} className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium">
                    {ap.services.map((s) => s.service?.name).filter(Boolean).join(', ')}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(ap.starts_at)}</div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">{ap.status}</Badge>
                  <div className="text-sm mt-1">{formatPrice(ap.total_price, currency)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
