'use client'

import { Badge, Button, Card, Skeleton } from '@doska/ui'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

import { useCategories, useServices } from '@/hooks/queries'
import { formatDuration, formatPrice } from '@/lib/format'
import { useBookingStore } from '@/store/useBookingStore'
import type { Service, ServiceCategory } from '@/types/booking'

export default function OwnerServices() {
  const { business } = useBookingStore()
  const currency = business?.settings?.currency || 'KZT'

  const { data: categories, isLoading: catsLoading } = useCategories(true)
  const { data: services, isLoading: svcLoading } = useServices({ include_inactive: true })

  const grouped = useMemo(() => {
    const cats = categories ?? []
    const svcs = services ?? []
    const buckets = new Map<number | null, Service[]>()
    for (const s of svcs) {
      const key = s.category_id ?? null
      const arr = buckets.get(key) ?? []
      arr.push(s)
      buckets.set(key, arr)
    }
    const ordered: Array<{ category: ServiceCategory | null; items: Service[] }> = []
    for (const c of cats) ordered.push({ category: c, items: buckets.get(c.id) ?? [] })
    if (buckets.has(null)) ordered.push({ category: null, items: buckets.get(null) ?? [] })
    return ordered
  }, [categories, services])

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold mb-3">Услуги</h1>

      <div className="flex gap-2 mb-3">
        <Link href="/owner/services/new" className="flex-1">
          <Button className="w-full">
            <Plus className="size-4 mr-1" /> Услуга
          </Button>
        </Link>
        <Link href="/owner/services/categories/new" className="flex-1">
          <Button className="w-full" variant="outline">
            <Plus className="size-4 mr-1" /> Категория
          </Button>
        </Link>
      </div>

      {catsLoading || svcLoading ? (
        <>
          <Skeleton className="h-20 w-full mb-2" />
          <Skeleton className="h-20 w-full" />
        </>
      ) : grouped.length === 0 ? (
        <Card className="p-4 text-center text-sm text-muted-foreground">
          Пока ничего нет. Создайте категорию и услугу.
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ category, items }) => (
            <div key={category?.id ?? 'uncat'}>
              <div className="flex items-center justify-between mb-1 px-1">
                <h2 className="font-medium text-sm uppercase text-muted-foreground">
                  {category?.name ?? 'Без категории'}
                </h2>
                {category && (
                  <Link
                    href={`/owner/services/categories/${category.id}`}
                    className="text-xs text-primary"
                  >
                    Изменить
                  </Link>
                )}
              </div>
              <div className="space-y-1">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-1">Нет услуг.</p>
                ) : (
                  items.map((s) => (
                    <Link key={s.id} href={`/owner/services/${s.id}`}>
                      <Card className="p-3 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {s.name}
                              {!s.is_active && <Badge variant="secondary">скрыто</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDuration(s.duration_min)}
                            </div>
                          </div>
                          <div className="font-semibold">{formatPrice(s.price, currency)}</div>
                        </div>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
