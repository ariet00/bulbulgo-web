'use client'

import { useMemo, useState } from 'react'

import { Button, Skeleton } from '@doska/ui'
import { cn, useScheduledPosts, type ScheduledPost } from '@doska/shared'
import { addDays, addWeeks, format, isSameDay, isToday, startOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { PlatformMark } from '@/components/accounts/PlatformMark'

import { ScheduledPostCard } from './ScheduledPostCard'
import { STATUS_DOT } from './scheduleStatus'

export function WeekPlanner({ accountId }: { accountId?: number }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const weekEnd = addDays(weekStart, 7)

  const { data, isLoading } = useScheduledPosts({
    account_id: accountId,
    date_from: weekStart.toISOString(),
    date_to: weekEnd.toISOString(),
    limit: 500,
  })
  const posts = data?.items || []
  const byDay = useMemo(
    () => days.map((day) => posts.filter((p) => isSameDay(new Date(p.scheduled_at), day))),
    [days, posts],
  )

  const rangeLabel = `${format(weekStart, 'd MMM', { locale: ru })} – ${format(addDays(weekStart, 6), 'd MMM yyyy', { locale: ru })}`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-medium">{rangeLabel}</h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            Сегодня
          </Button>
          <Button variant="ghost" size="icon" aria-label="Предыдущая неделя" onClick={() => setWeekStart((d) => addWeeks(d, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Следующая неделя" onClick={() => setWeekStart((d) => addWeeks(d, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week grid: a glance at the load per day. Hidden on phones, the list below is enough there. */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:grid md:grid-cols-7">
        {days.map((day, i) => (
          <div key={day.toISOString()} className={cn('min-h-[140px] border-r p-2 last:border-r-0', isToday(day) && 'bg-accent/30')}>
            <p className={cn('mb-2 text-xs', isToday(day) ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
              {format(day, 'EEEEEE d', { locale: ru })}
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <ul className="space-y-1">
                {byDay[i].map((p) => (
                  <DayChip key={p.id} post={p} />
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Full cards, grouped by day */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="font-medium">На этой неделе ничего не запланировано</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Запланировать пост можно из вкладки «Публикация» аккаунта или из его черновиков.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {days.map((day, i) =>
            byDay[i].length === 0 ? null : (
              <section key={day.toISOString()} className="space-y-2">
                <h3 className={cn('text-sm', isToday(day) ? 'font-semibold' : 'text-muted-foreground')}>
                  {format(day, 'EEEE, d MMMM', { locale: ru })}
                </h3>
                <div className="grid gap-3 lg:grid-cols-2">
                  {byDay[i].map((p) => (
                    <ScheduledPostCard key={p.id} post={p} />
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </div>
  )
}

function DayChip({ post }: { post: ScheduledPost }) {
  return (
    <li className="flex items-center gap-1.5 rounded-md border bg-background px-1.5 py-1 text-xs">
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STATUS_DOT[post.status])} />
      <span className="tabular-nums text-muted-foreground">{format(new Date(post.scheduled_at), 'HH:mm')}</span>
      <PlatformMark platform={post.account.platform} size="sm" className="h-4 w-4 rounded text-[8px]" />
      <span className="truncate">{post.content.text || 'медиа'}</span>
    </li>
  )
}
