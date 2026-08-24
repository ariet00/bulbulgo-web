'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from '@doska/ui'
import { cn } from '@doska/shared'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCreateProject, useUpdateProject } from '@/hooks/mutations'
import { PROJECT_COLORS } from '@/lib/constants'
import type { Project } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Введите название').max(120),
  note: z.string().max(1000).optional(),
  color: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Set → edit mode, empty → create. */
  project?: Project | null
}

export function ProjectFormDialog({ open, onOpenChange, project }: Props) {
  const create = useCreateProject()
  const update = useUpdateProject()
  const isEdit = Boolean(project)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', note: '', color: PROJECT_COLORS[0] },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      name: project?.name ?? '',
      note: project?.note ?? '',
      color: project?.color ?? PROJECT_COLORS[0],
    })
  }, [open, project, form])

  const color = form.watch('color')

  const onSubmit = form.handleSubmit((values) => {
    const payload = { ...values, note: values.note || null }
    const done = { onSuccess: () => onOpenChange(false) }
    if (project) update.mutate({ id: project.id, ...payload }, done)
    else create.mutate(payload, done)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать проект' : 'Новый проект'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Заметка</Label>
            <Textarea id="note" rows={3} {...form.register('note')} />
          </div>
          <div className="space-y-2">
            <Label>Цвет</Label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={value}
                  onClick={() => form.setValue('color', value)}
                  className={cn(
                    'h-7 w-7 rounded-full border-2 transition',
                    color === value ? 'border-foreground' : 'border-transparent',
                  )}
                  style={{ backgroundColor: value }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {isEdit ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
