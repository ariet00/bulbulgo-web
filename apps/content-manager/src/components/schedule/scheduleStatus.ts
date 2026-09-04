import type { ScheduledPostStatus } from '@doska/shared'

// Visual treatment per status; labels live in @doska/shared next to the type.
export const STATUS_DOT: Record<ScheduledPostStatus, string> = {
  scheduled: 'bg-brand',
  publishing: 'bg-brand animate-pulse',
  published: 'bg-success',
  failed: 'bg-destructive',
  cancelled: 'bg-muted-foreground/50',
}
