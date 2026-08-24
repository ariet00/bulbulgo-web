'use client'

import { cn } from '@doska/shared'

import { STATUS_TONES, labelOf } from '@/lib/labels'
import type { MetaOption } from '@/types'

export function StatusChip({
  value,
  options,
  className,
}: {
  value: string
  options?: MetaOption[]
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_TONES[value] ?? 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {labelOf(options, value)}
    </span>
  )
}
