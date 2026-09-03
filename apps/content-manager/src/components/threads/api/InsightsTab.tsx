'use client'

import { useEffect, useState } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton } from '@doska/ui'
import { useThreadMediaInsights, useThreadsAccountInsights, useUserThreads } from '@doska/shared'

import { formatCount } from '@/lib/format'

import { METRIC_LABELS, metricValue, type ThreadsInsightMetric } from './insights'

interface InsightsTabProps {
  accountId: number
  initialMediaId?: string | null
}

function errorText(error: unknown, fallback: string): string {
  const msg = (error as any)?.response?.data?.message
  return typeof msg === 'string' && msg ? msg : fallback
}

function MetricGrid({
  metrics,
  pick,
}: {
  metrics: ThreadsInsightMetric[]
  pick: 'last' | 'first'
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m) => {
        const meta = METRIC_LABELS[m.name]
        return (
          <div key={m.name} className="rounded-xl border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{meta?.label || m.title || m.name}</dt>
            <dd className="mt-1 font-display text-2xl font-medium tabular-nums">
              {formatCount(metricValue(m, pick))}
            </dd>
            {(meta?.hint || m.description) && (
              <p className="mt-1 text-xs text-muted-foreground">{meta?.hint || m.description}</p>
            )}
          </div>
        )
      })}
    </dl>
  )
}

function GridSkeleton({ n }: { n: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton key={i} className="h-[92px] rounded-xl" />
      ))}
    </div>
  )
}

export function InsightsTab({ accountId, initialMediaId }: InsightsTabProps) {
  const account = useThreadsAccountInsights(accountId)
  const { data: threads } = useUserThreads(accountId)
  const posts = threads?.data || []
  const [mediaId, setMediaId] = useState<string | null>(initialMediaId ?? null)
  useEffect(() => {
    if (initialMediaId) setMediaId(initialMediaId)
  }, [initialMediaId])
  const media = useThreadMediaInsights(mediaId ? accountId : null, mediaId)

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="font-medium">Аккаунт</h2>
          <p className="text-sm text-muted-foreground">Суммарно по всем постам за последние дни</p>
        </div>
        {account.isLoading ? (
          <GridSkeleton n={6} />
        ) : account.isError ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            {errorText(account.error, 'Threads не отдал статистику аккаунта.')} Число подписчиков
            доступно только аккаунтам с сотней подписчиков и больше.
          </p>
        ) : (
          <MetricGrid metrics={account.data?.data || []} pick="last" />
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-medium">Пост</h2>
          <p className="text-sm text-muted-foreground">Выберите пост, чтобы увидеть его показатели</p>
        </div>
        <Select value={mediaId ?? ''} onValueChange={(v) => setMediaId(v || null)}>
          <SelectTrigger className="w-full sm:max-w-md">
            <SelectValue placeholder="Выбрать пост" />
          </SelectTrigger>
          <SelectContent>
            {posts.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {(t.text || t.media_type || t.id).slice(0, 60)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {mediaId &&
          (media.isLoading ? (
            <GridSkeleton n={6} />
          ) : media.isError ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              {errorText(media.error, 'Threads не отдал статистику этого поста.')}
            </p>
          ) : (
            <MetricGrid metrics={media.data?.data || []} pick="first" />
          ))}
      </section>
    </div>
  )
}
