'use client'

import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@doska/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { bookingApi } from '@/apis/booking'
import type { ServiceCategory } from '@/types/booking'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  category?: ServiceCategory | null
}

export function CategoryForm({ open, onOpenChange, category }: Props) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [order, setOrder] = useState(0)

  useEffect(() => {
    setName(category?.name ?? '')
    setOrder(category?.order ?? 0)
  }, [category, open])

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
      onOpenChange(false)
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
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Ошибка')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{category ? 'Редактировать категорию' : 'Новая категория'}</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 pt-4">
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
            <Button className="flex-1" onClick={submit}>
              {category ? 'Сохранить' : 'Создать'}
            </Button>
            {category && (
              <Button variant="outline" onClick={onDelete} disabled={remove.isPending}>
                Удалить
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
