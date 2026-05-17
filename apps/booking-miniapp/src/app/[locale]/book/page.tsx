'use client'

import { Button, Card, Skeleton } from '@doska/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useCategories, useServices } from '@/hooks/queries'
import { formatDuration, formatPrice } from '@/lib/format'
import { useBookingStore } from '@/store/useBookingStore'

export default function BookPage() {
  const router = useRouter()
  const { business } = useBookingStore()
  const currency = business?.settings?.currency || 'KZT'

  const { data: categories, isLoading: catsLoading } = useCategories()
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)
  const { data: services, isLoading: svcLoading } = useServices(
    activeCategoryId ? { category_id: activeCategoryId } : undefined,
  )
  const [selected, setSelected] = useState<number[]>([])

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const selectedServices = (services || []).filter((s) => selected.includes(s.id))
  const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0)
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_min, 0)

  const proceed = () => {
    if (selected.length === 0) return
    const constraining = selectedServices
      .map((s) => s.staff_ids ?? [])
      .filter((arr) => arr.length > 0)
    const intersection = constraining.reduce<number[]>(
      (acc, arr) => (acc.length === 0 ? arr : acc.filter((x) => arr.includes(x))),
      [],
    )
    const needsStaffPick = constraining.length > 0 && intersection.length > 1
    const qsParts = selected.map((id) => `service_ids=${id}`)
    if (needsStaffPick) {
      router.push(`/book/staff?${qsParts.join('&')}`)
    } else {
      router.push(`/book/slot?${qsParts.join('&')}`)
    }
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-32">
      <h1 className="text-xl font-semibold mb-1">{business?.company.name ?? 'Запись'}</h1>
      <p className="text-sm text-muted-foreground mb-4">Выберите услуги</p>

      {catsLoading ? (
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      ) : (
        (categories?.length ?? 0) > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            <Button
              size="sm"
              variant={activeCategoryId === null ? 'default' : 'outline'}
              onClick={() => setActiveCategoryId(null)}
            >
              Все
            </Button>
            {(categories ?? []).map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={activeCategoryId === c.id ? 'default' : 'outline'}
                onClick={() => setActiveCategoryId(c.id)}
              >
                {c.name}
              </Button>
            ))}
          </div>
        )
      )}

      <div className="space-y-2">
        {svcLoading ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : (services?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет доступных услуг.</p>
        ) : (
          (services ?? []).map((svc) => {
            const isSel = selected.includes(svc.id)
            return (
              <Card
                key={svc.id}
                onClick={() => toggle(svc.id)}
                className={`p-3 cursor-pointer border-2 transition-colors ${
                  isSel ? 'border-primary' : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{svc.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDuration(svc.duration_min)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(svc.price, currency)}</div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
          <div className="mx-auto max-w-md flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold">{formatPrice(totalPrice, currency)}</div>
              <div className="text-muted-foreground">{formatDuration(totalDuration)}</div>
            </div>
            <Button onClick={proceed}>Выбрать время →</Button>
          </div>
        </div>
      )}
    </main>
  )
}
