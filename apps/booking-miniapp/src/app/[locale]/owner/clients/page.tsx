'use client'

import { Button, Card, Input, Skeleton } from '@doska/ui'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { useClients } from '@/hooks/queries'
import { formatPrice } from '@/lib/format'
import { useBookingStore } from '@/store/useBookingStore'

export default function OwnerClients() {
  const { business } = useBookingStore()
  const currency = business?.settings?.currency || 'KZT'

  const [search, setSearch] = useState('')
  const { data, isLoading } = useClients(search || undefined)

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold mb-3">Клиенты</h1>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Имя или телефон"
            className="pl-8"
          />
        </div>
        <Link href="/owner/clients/new">
          <Button size="default">
            <Plus className="size-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <>
          <Skeleton className="h-14 w-full mb-2" />
          <Skeleton className="h-14 w-full" />
        </>
      ) : (data?.length ?? 0) === 0 ? (
        <Card className="p-4 text-center text-sm text-muted-foreground">
          {search ? 'Ничего не найдено.' : 'Пока нет клиентов.'}
        </Card>
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((c) => (
            <Link key={c.id} href={`/owner/clients/${c.id}`}>
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    {c.phone && (
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{c.visits_count} визитов</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPrice(c.total_spent, currency)}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
