'use client'

import { Button, Input, Label } from '@doska/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { bookingApi } from '@/apis/booking'
import type { ServiceCategory } from '@/types/booking'

type Props = {
  category?: ServiceCategory | null
  onDone: () => void
}

export function CategoryForm({ category, onDone }: Props) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [order, setOrder] = useState(0)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setOrder(category.order)
    }
  }, [category])

  const create = useMutation({
    mutationFn: bookingApi.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'categories'] }),
  })
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<ServiceCategory> }) =>
      bookingApi.updateCategory(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'categories'] }),
  })
  const remove = useMutation({
    mutationFn: bookingApi.deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'categories'] }),
  })

  const submit = async () => {
    if (!name.trim()) return
    try {
      if (category) {
        await update.mutateAsync({ id: category.id, patch: { name: name.trim(), order } })
      } else {
        await create.mutateAsync({ name: name.trim(), order })
      }
      toast.success('Сохранено')
      onDone()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  const onDelete = async () => {
    if (!category) return
    if (!confirm('Удалить категорию? Услуги в ней останутся без категории.')) return
    try {
      await remove.mutateAsync(category.id)
      toast.success('Удалено')
      onDone()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Название</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Стрижки" />
      </div>
      <div>
        <Label>Порядок сортировки</Label>
        <Input
          type="number"
          value={order}
          onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button className="flex-1" onClick={submit} disabled={create.isPending || update.isPending}>
          {category ? 'Сохранить' : 'Создать'}
        </Button>
        {category && (
          <Button variant="outline" onClick={onDelete} disabled={remove.isPending}>
            Удалить
          </Button>
        )}
      </div>
    </div>
  )
}
