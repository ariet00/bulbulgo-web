'use client'

import React, { useState } from 'react'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@doska/ui'
import {
  useDeleteThread,
  useHideThreadsReply,
  useReplyToThread,
  useThreadReplies,
  useUserThreads,
} from '@doska/shared'
import {
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Send,
  Trash2,
} from 'lucide-react'

export function ThreadsRepliesTab({ accountId }: { accountId: number }) {
  const { data: threads, isLoading } = useUserThreads(accountId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: replies, isLoading: repliesLoading } = useThreadReplies(
    selectedId ? accountId : null,
    selectedId,
  )
  const reply = useReplyToThread()
  const hide = useHideThreadsReply()
  const del = useDeleteThread()
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})

  return (
    <div className="grid gap-4 md:grid-cols-[300px,1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Мои Threads</CardTitle>
          <CardDescription className="text-xs">
            Выберите пост, чтобы увидеть ответы
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto space-y-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {(threads?.data || []).map((t) => (
            <div
              key={t.id}
              className={`rounded border p-2 cursor-pointer ${
                selectedId === t.id ? 'border-primary' : ''
              } hover:bg-muted/50`}
              onClick={() => setSelectedId(t.id)}
            >
              <div className="flex gap-2">
                {(t.thumbnail_url || t.media_url) && t.media_type !== 'TEXT_POST' && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.thumbnail_url || t.media_url}
                    alt=""
                    className="h-12 w-12 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0 text-xs space-y-1">
                  <p className="truncate">
                    {t.text || <span className="italic">{t.media_type}</span>}
                  </p>
                  <p className="text-muted-foreground">
                    {t.timestamp?.slice(0, 16)}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-1">
                {t.permalink && (
                  <a
                    href={t.permalink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Удалить пост?')) {
                      del.mutate({ accountId, threadId: t.id })
                    }
                  }}
                  className="text-[10px] text-muted-foreground hover:text-destructive inline-flex items-center"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ответы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
          {!selectedId && (
            <p className="text-sm text-muted-foreground">
              Выберите пост слева.
            </p>
          )}
          {repliesLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {(replies?.data || []).map((r) => {
            const isHidden = r.hide_status === 'HIDDEN'
            return (
              <div key={r.id} className="rounded border p-3 space-y-2 text-sm">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    <strong className="text-foreground">@{r.username}</strong>
                    {isHidden && (
                      <span className="ml-2 text-amber-600">(скрыт)</span>
                    )}
                  </span>
                  <span>{r.timestamp?.slice(0, 16)}</span>
                </div>
                <p>{r.text}</p>
                <div className="flex gap-1 text-xs">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      hide.mutate({
                        accountId,
                        replyId: r.id,
                        hide: !isHidden,
                      })
                    }
                  >
                    {isHidden ? (
                      <Eye className="h-3 w-3 mr-1" />
                    ) : (
                      <EyeOff className="h-3 w-3 mr-1" />
                    )}
                    {isHidden ? 'Показать' : 'Скрыть'}
                  </Button>
                </div>
                <div className="flex gap-2 pt-1">
                  <Input
                    value={replyDrafts[r.id] || ''}
                    onChange={(e) =>
                      setReplyDrafts((d) => ({ ...d, [r.id]: e.target.value }))
                    }
                    placeholder="Ответить…"
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    disabled={!replyDrafts[r.id]}
                    onClick={async () => {
                      await reply.mutateAsync({
                        accountId,
                        mediaId: r.id,
                        text: replyDrafts[r.id],
                      })
                      setReplyDrafts((d) => ({ ...d, [r.id]: '' }))
                    }}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
