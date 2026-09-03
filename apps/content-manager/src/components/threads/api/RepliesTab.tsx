'use client'

import { useEffect, useState } from 'react'

import { Button, Skeleton, Textarea } from '@doska/ui'
import {
  cn,
  THREADS_TEXT_LIMIT,
  useHideThreadsReply,
  useReplyToThread,
  useThreadReplies,
  useUserThreads,
  type ThreadsReply,
} from '@doska/shared'
import { Eye, EyeOff, ExternalLink, Loader2, Send } from 'lucide-react'

import { formatRelative } from '@/lib/format'

import { ThreadPostItem } from './ThreadPostItem'

interface RepliesTabProps {
  accountId: number
  /** Post to open first, e.g. when arriving from the Posts tab. */
  initialMediaId?: string | null
}

export function RepliesTab({ accountId, initialMediaId }: RepliesTabProps) {
  const { data: threads, isLoading } = useUserThreads(accountId)
  const posts = threads?.data || []
  const [selectedId, setSelectedId] = useState<string | null>(initialMediaId ?? null)

  useEffect(() => {
    if (initialMediaId) setSelectedId(initialMediaId)
  }, [initialMediaId])

  // Default to the newest post so the tab is never empty on arrival.
  useEffect(() => {
    if (!selectedId && posts.length > 0) setSelectedId(posts[0].id)
  }, [posts, selectedId])

  const selected = posts.find((p) => p.id === selectedId) || null
  const { data: replies, isLoading: repliesLoading } = useThreadReplies(
    selectedId ? accountId : null,
    selectedId,
  )
  const list = replies?.data || []

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <section className="space-y-2">
        <p className="px-1 text-xs text-muted-foreground">Ваши посты</p>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[76px] rounded-lg" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Ответы появятся, когда будет хотя бы один пост.
          </p>
        ) : (
          <ul className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
            {posts.map((post) => (
              <li key={post.id}>
                <ThreadPostItem
                  post={post}
                  selected={post.id === selectedId}
                  onSelect={() => setSelectedId(post.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="min-w-0 space-y-3">
        {selected ? (
          <>
            <div className="flex items-start justify-between gap-3 rounded-xl border bg-card p-4">
              <div className="min-w-0 space-y-1">
                <p className="whitespace-pre-wrap break-words text-sm">
                  {selected.text || <span className="italic text-muted-foreground">Пост без текста</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selected.timestamp && formatRelative(selected.timestamp)}
                  {list.length > 0 && `, ответов: ${list.length}`}
                </p>
              </div>
              {selected.permalink && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={selected.permalink} target="_blank" rel="noreferrer" aria-label="Открыть в Threads">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>

            {repliesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : list.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Под этим постом пока никто не ответил.
              </p>
            ) : (
              <ul className="space-y-2">
                {list.map((r) => (
                  <li key={r.id}>
                    <ReplyItem reply={r} accountId={accountId} />
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          !isLoading && (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Выберите пост слева.
            </p>
          )
        )}
      </section>
    </div>
  )
}

function ReplyItem({ reply, accountId }: { reply: ThreadsReply; accountId: number }) {
  const hide = useHideThreadsReply()
  const answer = useReplyToThread()
  const [draft, setDraft] = useState('')
  const [answering, setAnswering] = useState(false)
  const isHidden = reply.hide_status === 'HIDDEN'

  const send = async () => {
    const text = draft.trim()
    if (!text) return
    await answer.mutateAsync({ accountId, mediaId: reply.id, text })
    setDraft('')
    setAnswering(false)
  }

  return (
    <article className={cn('space-y-3 rounded-lg border bg-card p-4', isHidden && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
          {(reply.username || '?').slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm">
            <span className="font-semibold">{reply.username}</span>
            <span className="text-muted-foreground"> {reply.timestamp && formatRelative(reply.timestamp)}</span>
            {isHidden && <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">скрыт</span>}
          </p>
          <p className="whitespace-pre-wrap break-words text-sm">{reply.text}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAnswering((v) => !v)}
          aria-expanded={answering}
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          Ответить
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={hide.isPending}
          onClick={() => hide.mutate({ accountId, replyId: reply.id, hide: !isHidden })}
        >
          {isHidden ? <Eye className="mr-1.5 h-3.5 w-3.5" /> : <EyeOff className="mr-1.5 h-3.5 w-3.5" />}
          {isHidden ? 'Показать' : 'Скрыть'}
        </Button>
        {reply.permalink && (
          <Button variant="ghost" size="sm" asChild>
            <a href={reply.permalink} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />В Threads
            </a>
          </Button>
        )}
      </div>

      {answering && (
        <div className="space-y-2">
          <Textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={THREADS_TEXT_LIMIT}
            rows={2}
            placeholder={`Ответ для ${reply.username}`}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setAnswering(false)}>
              Отмена
            </Button>
            <Button size="sm" onClick={send} disabled={!draft.trim() || answer.isPending}>
              {answer.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Отправить
            </Button>
          </div>
        </div>
      )}
    </article>
  )
}
