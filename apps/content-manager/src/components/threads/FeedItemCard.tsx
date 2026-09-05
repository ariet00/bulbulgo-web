'use client'

import { useState } from 'react'

import { Button } from '@doska/ui'
import {
  cn,
  THREADS_SEARCH_TYPE_LABELS,
  useDeleteThreadsRecommendation,
  type ThreadsFeedItem,
  type ThreadsSearchType,
} from '@doska/shared'
import { ExternalLink, Hash, Search, Trash2 } from 'lucide-react'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { formatRelative } from '@/lib/format'

const LONG_TEXT = 220

export function FeedItemCard({ item }: { item: ThreadsFeedItem }) {
  const remove = useDeleteThreadsRecommendation()
  const [confirm, setConfirm] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const raw = item.raw_data || {}
  const permalink = raw.permalink || `https://www.threads.net/@${item.author_username}/post/${item.external_id}`
  const isLong = (item.text?.length || 0) > LONG_TEXT
  const rank = typeof raw.rank === 'number' ? raw.rank + 1 : null
  const searchTypeLabel = raw.search_type ? THREADS_SEARCH_TYPE_LABELS[raw.search_type as ThreadsSearchType] : null
  const image = raw.thumbnail_url || (raw.media_type === 'IMAGE' ? raw.media_url : undefined)
  const when = raw.timestamp
    ? formatRelative(raw.timestamp)
    : item.created_at
      ? `собран ${formatRelative(item.created_at)}`
      : ''

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border bg-card p-4">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">@{item.author_username}</p>
          <p className="text-xs text-muted-foreground">{when}</p>
        </div>
        {raw.query && (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px]"
            title={searchTypeLabel ? `${searchTypeLabel}, позиция ${rank ?? '?'}` : undefined}
          >
            {raw.search_mode === 'TAG' ? <Hash className="h-3 w-3" aria-hidden /> : <Search className="h-3 w-3" aria-hidden />}
            {raw.query}
            {rank !== null && <span className="text-muted-foreground">· {rank}</span>}
          </span>
        )}
      </header>

      <p className={cn('whitespace-pre-wrap break-words text-sm leading-relaxed', !expanded && 'line-clamp-5')}>
        {item.text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="self-start text-xs font-medium text-brand hover:underline"
        >
          {expanded ? 'Свернуть' : 'Читать дальше'}
        </button>
      )}
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" loading="lazy" className="max-h-48 w-full rounded-lg border object-cover" />
      )}

      <footer className="mt-auto flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
        <span>{searchTypeLabel}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <a href={permalink} target="_blank" rel="noreferrer" aria-label="Открыть в Threads">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            aria-label="Убрать из трендов"
            onClick={() => setConfirm(true)}
            disabled={remove.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </footer>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Убрать пост из трендов?"
        description="Он больше не попадёт в сводку для генератора. При следующем сборе может вернуться."
        confirmLabel="Убрать"
        destructive
        pending={remove.isPending}
        onConfirm={async () => {
          await remove.mutateAsync(item.id)
          setConfirm(false)
        }}
      />
    </article>
  )
}
