import { cn } from '@doska/shared'
import type { Platform } from '@doska/shared'

import { PLATFORM_MARKS } from './platform'

const SIZES = {
  sm: 'h-7 w-7 text-[11px] rounded-md',
  md: 'h-10 w-10 text-[13px] rounded-lg',
  lg: 'h-14 w-14 text-lg rounded-xl',
} as const

export function PlatformMark({
  platform,
  size = 'md',
  className,
}: {
  platform: Platform
  size?: keyof typeof SIZES
  className?: string
}) {
  const mark = PLATFORM_MARKS[platform]
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center font-display font-semibold leading-none ring-1 ring-inset ring-white/15',
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: mark.bg, color: mark.fg }}
    >
      {mark.mono}
    </span>
  )
}
