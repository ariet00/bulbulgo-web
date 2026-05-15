'use client'

import { Button, Card, Input, Sheet, SheetContent, SheetHeader, SheetTitle, Skeleton } from '@doska/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { bookingApi } from '@/apis/booking'
import { useClients } from '@/hooks/queries'
import { formatPrice } from '@/lib/format'
import { useBookingStore } from '@/store/useBookingStore'

export default function OwnerClients() {
  const { business } = useBookingStore()
  const currency = business?.settings?.currency || 'KZT'
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const { data, isLoading } = useClients(search || undefined)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const create = useMutation({
    mutationFn: bookingApi.createClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'clients'] }),
  })

  const submit = async () => {
    if (!name.trim()) {
      toast.error('Имя обязательно')
      return
    }
    try {
      await create.mutateAsync({ name: name.trim(), phone: phone || undefined })
      toast.success('Клиент добавлен')
      setName('')
      setPhone('')
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

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
        <Button onClick={() => setOpen(true)} size="default">
          <Plus className="size-4" />
        </Button>
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Новый клиент</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 pt-4">
            <div>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" />
            </div>
            <div>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Телефон"
                inputMode="tel"
              />
            </div>
            <Button onClick={submit} className="w-full" disabled={create.isPending}>
              Создать
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
