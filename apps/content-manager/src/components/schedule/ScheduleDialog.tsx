'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@doska/ui'
import { Loader2 } from 'lucide-react'

import { formatDateTime } from '@/lib/format'
import {
  browserTimeZone,
  fromLocalInputValue,
  schedulePresets,
  toLocalInputValue,
} from '@/lib/schedule-time'

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: React.ReactNode
  confirmLabel?: string
  /** Pre-filled moment (ISO) when rescheduling. */
  initialAt?: string | null
  pending?: boolean
  onConfirm: (isoUtc: string, timezone: string) => Promise<void> | void
}

/** One place where a moment is picked; used by the composer, drafts and the planner. */
export function ScheduleDialog({
  open,
  onOpenChange,
  title = 'Когда опубликовать?',
  description,
  confirmLabel = 'Запланировать',
  initialAt,
  pending,
  onConfirm,
}: ScheduleDialogProps) {
  const [value, setValue] = useState('')
  const timezone = useMemo(() => browserTimeZone(), [])

  useEffect(() => {
    if (!open) return
    const start = initialAt ? new Date(initialAt) : schedulePresets()[0].at
    setValue(toLocalInputValue(start))
  }, [open, initialAt])

  const picked = fromLocalInputValue(value)
  const inPast = picked ? picked.getTime() < Date.now() - 60_000 : false
  const blocker = !picked ? 'Выберите дату и время' : inPast ? 'Это время уже прошло' : null

  const confirm = async () => {
    if (!picked || blocker) return
    await onConfirm(picked.toISOString(), timezone)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {schedulePresets().map((p) => (
              <Button
                key={p.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue(toLocalInputValue(p.at))}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="schedule-at">Дата и время</Label>
            <Input
              id="schedule-at"
              type="datetime-local"
              value={value}
              min={toLocalInputValue(new Date())}
              onChange={(e) => setValue(e.target.value)}
              aria-invalid={!!blocker || undefined}
            />
            <p className="text-xs text-muted-foreground">
              {blocker ?? (picked && `Выйдет ${formatDateTime(picked)}, часовой пояс ${timezone}`)}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Отмена
          </Button>
          <Button onClick={confirm} disabled={!!blocker || pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
