'use client'

import { Button, Input, Label } from '@doska/ui'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useCreateService, useUpdateService } from '@/hooks/mutations'
import type { Service, ServiceCategory } from '@/types/booking'

type Props = {
  service?: Service | null
  categories: ServiceCategory[]
  onDone: () => void
}

export function ServiceForm({ service, categories, onDone }: Props) {
  const create = useCreateService()
  const update = useUpdateService()

  const [name, setName] = useState('')
  const [duration, setDuration] = useState(30)
  const [price, setPrice] = useState('0')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [bufferBefore, setBufferBefore] = useState(0)
  const [bufferAfter, setBufferAfter] = useState(0)
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (service) {
      setName(service.name)
      setDuration(service.duration_min)
      setPrice(service.price)
      setCategoryId(service.category_id)
      setBufferBefore(service.buffer_before_min)
      setBufferAfter(service.buffer_after_min)
      setDescription(service.description || '')
    }
  }, [service])

  const submit = async () => {
    if (!name.trim() || duration <= 0) {
      toast.error('Заполните название и длительность')
      return
    }
    const payload = {
      name: name.trim(),
      duration_min: duration,
      price,
      category_id: categoryId,
      buffer_before_min: bufferBefore,
      buffer_after_min: bufferAfter,
      description: description || undefined,
    }
    try {
      if (service) {
        await update.mutateAsync({ id: service.id, patch: payload })
        toast.success('Услуга обновлена')
      } else {
        await create.mutateAsync(payload)
        toast.success('Услуга создана')
      }
      onDone()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  const toggleActive = async () => {
    if (!service) return
    try {
      await update.mutateAsync({ id: service.id, patch: { is_active: !service.is_active } })
      toast.success(service.is_active ? 'Услуга скрыта' : 'Услуга активна')
      onDone()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Название</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Стрижка" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Длительность, мин</Label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div>
          <Label>Цена</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Категория</Label>
        <select
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value, 10) : null)}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="">Без категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Буфер до, мин</Label>
          <Input
            type="number"
            value={bufferBefore}
            onChange={(e) => setBufferBefore(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div>
          <Label>Буфер после, мин</Label>
          <Input
            type="number"
            value={bufferAfter}
            onChange={(e) => setBufferAfter(parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </div>

      <div>
        <Label>Описание</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button className="flex-1" onClick={submit} disabled={create.isPending || update.isPending}>
          {service ? 'Сохранить' : 'Создать'}
        </Button>
        {service && (
          <Button variant="outline" onClick={toggleActive}>
            {service.is_active ? 'Скрыть' : 'Показать'}
          </Button>
        )}
      </div>
    </div>
  )
}
