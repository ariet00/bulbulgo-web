'use client'

import { Button, Input, Label } from '@doska/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { bookingApi } from '@/apis/booking'

export default function NewClientPage() {
  const router = useRouter()
  const qc = useQueryClient()

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
      router.push('/owner/clients')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/owner/clients">
          <Button variant="ghost" size="sm" className="px-2">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Новый клиент</h1>
      </div>

      <div className="space-y-3">
        <div>
          <Label>Имя</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" />
        </div>
        <div>
          <Label>Телефон</Label>
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
    </main>
  )
}
