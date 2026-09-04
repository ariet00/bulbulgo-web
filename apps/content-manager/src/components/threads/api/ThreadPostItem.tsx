'use client'

import { cn, THREADS_MEDIA_TYPE_LABELS, type ThreadsMedia } from '@doska/shared'
import { ImageIcon, MapPin, Video } from 'lucide-react'

import { formatRelative } from '@/lib/format'

interface ThreadPostItemProps {
  post: ThreadsMedia
  selected?: boolean
  onSelect?: () => void
  /** Row actions, rendered to the right; they receive clicks before `onSelect`. */
  actions?: React.ReactNode
  /** For posts by other people (search results). */
  showAuthor?: boolean
}

// `TEXT` comes from keyword search, `TEXT_POST` from the user's own feed.
const TEXT_ONLY_TYPES = ['TEXT', 'TEXT_POST', 'REPOST_FACADE']

function Thumb({ post }: { post: ThreadsMedia }) {
  const src = post.thumbnail_url || post.media_url
  const isVisual = !TEXT_ONLY_TYPES.includes(post.media_type || '')
  if (!isVisual) return null
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" loading="lazy" />
    )
  }
  const Icon = post.media_type === 'VIDEO' ? Video : ImageIcon
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="h-5 w-5" />
    </span>
  )
}

export function ThreadPostItem({ post, selected, onSelect, actions, showAuthor }: ThreadPostItemProps) {
  const typeLabel = THREADS_MEDIA_TYPE_LABELS[post.media_type || ''] || post.media_type
  const place = post.location ? [post.location.name, post.location.city].filter(Boolean).join(', ') : null
  const body = (
    <>
      <Thumb post={post} />
      <div className="min-w-0 flex-1 space-y-1">
        <p className={cn('line-clamp-2 text-sm', !post.text && 'italic text-muted-foreground')}>
          {post.text || `${typeLabel} без подписи`}
        </p>
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
          {showAuthor && post.username && <span className="font-medium text-foreground">@{post.username}</span>}
          <span>
            {typeLabel}
            {post.timestamp && `, ${formatRelative(post.timestamp)}`}
          </span>
          {place && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="h-3 w-3" aria-hidden />
              {place}
            </span>
          )}
        </p>
      </div>
    </>
  )

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors',
        onSelect && 'cursor-pointer hover:border-brand/60',
        selected && 'border-brand bg-accent/40',
      )}
    >
      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {body}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-start gap-3">{body}</div>
      )}
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  )
}
