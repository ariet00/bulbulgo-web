// Human names for the metrics `backend/apps/content_manager/meta/threads_insights.py`
// requests (ACCOUNT_METRICS / MEDIA_METRICS). Unknown names fall back to the
// title Threads sends.
export const METRIC_LABELS: Record<string, { label: string; hint?: string }> = {
  views: { label: 'Просмотры', hint: 'Сколько раз посты показали' },
  likes: { label: 'Лайки' },
  replies: { label: 'Ответы' },
  reposts: { label: 'Репосты' },
  quotes: { label: 'Цитаты' },
  shares: { label: 'Отправки', hint: 'Сколько раз пост отправили другим' },
  followers_count: { label: 'Подписчики' },
}

export interface ThreadsInsightMetric {
  name: string
  title?: string
  description?: string
  period?: string
  total_value?: { value?: number }
  values?: Array<{ value?: number; end_time?: string }>
}

/**
 * Threads returns either a `total_value` or a `values` series. The series is
 * daily buckets for account metrics (take the latest) and a single bucket for
 * media metrics (take the first).
 */
export function metricValue(
  m: ThreadsInsightMetric,
  pick: 'last' | 'first' = 'last',
): number | null {
  if (m.total_value?.value !== undefined) return m.total_value.value ?? null
  const series = m.values || []
  if (series.length === 0) return null
  const bucket = pick === 'last' ? series[series.length - 1] : series[0]
  return bucket?.value ?? null
}
