import type { DailyCapSource, MetaOption, Task } from '@/types'

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
  running: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  not_connected: 'bg-muted text-muted-foreground',
  unchecked: 'bg-muted text-muted-foreground',
  unauthorized: 'bg-destructive/10 text-destructive',
  failed: 'bg-destructive/10 text-destructive',
  proxy_error: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  spam_block: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  frozen: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
}

/** Where a task's enforced daily ceiling came from — mirrors
 *  `backend/apps/tglab/constants.py:DAILY_CAP_SOURCE_LABELS`. */
export const DAILY_CAP_SOURCE_LABELS: Record<DailyCapSource, string> = {
  task: 'лимит задачи',
  group: 'потолок группы',
}

/** Name of the clock the daily limits roll over on — mirrors
 *  `backend/apps/tglab/constants.py:DAILY_RESET_TZ_LABEL`. */
export const DAILY_RESET_TZ_LABEL = 'Бишкек'

/** Today's counter as the operator should read it: `2 / 2`, not `2 / 5`.
 *
 *  The number in `daily_limit` is what they asked for; what actually runs is
 *  `progress.daily_cap` — the target group's size caps inviting on top of it.
 *  Showing the asked-for number is how a task looks stuck for no reason, so the
 *  cell shows the enforced one and says where it comes from.
 */
export function todayCounter(task: Task): { text: string; note?: string; hint: string } {
  const { done_today: done, daily_cap: cap, daily_cap_source: source, group_members } = task.progress
  const text = cap ? `${done} / ${cap}` : `${done}`
  const reset = `Сбрасывается в полночь (${DAILY_RESET_TZ_LABEL}).`
  if (!cap || !source) return { text, hint: `Дневной лимит не задан. ${reset}` }
  if (source === 'group') {
    const members = group_members ? ` (участников: ${group_members})` : ''
    const own = task.daily_limit ? `, ниже лимита задачи — ${task.daily_limit}` : ''
    return {
      text,
      note: DAILY_CAP_SOURCE_LABELS.group,
      hint: `Потолок целевой группы${members}${own}. ${reset}`,
    }
  }
  return { text, hint: `${DAILY_CAP_SOURCE_LABELS.task}: ${cap}. ${reset}` }
}
