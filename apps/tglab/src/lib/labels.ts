import type { MetaOption } from '@/types'

/** Label of a value from a `/tglab/meta` dictionary, falling back to the raw
 *  value so an unknown one is visible instead of blank. */
export function labelOf(options: MetaOption[] | undefined, value: string | null): string {
  if (!value) return '—'
  return options?.find((o) => o.value === value)?.label ?? value
}

/** Colour of a status chip. Everything not listed reads as neutral. */
export const STATUS_TONES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  ok: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  not_connected: 'bg-muted text-muted-foreground',
  unchecked: 'bg-muted text-muted-foreground',
  unauthorized: 'bg-destructive/10 text-destructive',
  failed: 'bg-destructive/10 text-destructive',
  proxy_error: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  spam_block: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  frozen: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
}
