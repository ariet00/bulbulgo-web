'use client'

import { useState } from 'react'

import { Button, Skeleton } from '@doska/ui'
import { useDeleteThread, useUserThreads, type ThreadsMedia } from '@doska/shared'
import { BarChart3, ExternalLink, MessageSquare, RefreshCcw, Trash2 } from 'lucide-react'

import { ConfirmDialog } from '@/components/ConfirmDialog'

import { ThreadPostItem } from './ThreadPostItem'

interface PostsTabProps {
  accountId: number
  onOpenReplies: (mediaId: string) => void
  onOpenInsights: (mediaId: string) => void
  onCompose: () => void
}

export function PostsTab({ accountId, onOpenReplies, onOpenInsights, onCompose }: PostsTabProps) {
  const { data, isLoading, isFetching, refetch } = useUserThreads(accountId)
  const remove = useDeleteThread()
  const [toDelete, setToDelete] = useState<ThreadsMedia | null>(null)
  const posts = data?.data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Загружаем посты из Threads' : `Последние посты: ${posts.length}`}
        </p>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {isLoading ? (
        <ul className="space-y-2" aria-busy>
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex gap-3 rounded-lg border bg-card p-3">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-24" />
              </div>
            </li>
          ))}
        </ul>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="font-medium">В Threads пока нет постов</p>
          <p className="mt-1 text-sm text-muted-foreground">Напишите первый прямо отсюда.</p>
          <Button className="mt-4" onClick={onCompose}>
            Написать пост
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {posts.map((post) => (
            <li key={post.id}>
              <ThreadPostItem
                post={post}
                actions={
                  <>
                    <Button variant="ghost" size="sm" onClick={() => onOpenReplies(post.id)}>
                      <MessageSquare className="mr-1.5 h-4 w-4" />
                      Ответы
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onOpenInsights(post.id)}>
                      <BarChart3 className="mr-1.5 h-4 w-4" />
                      Статистика
                    </Button>
                    {post.permalink && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={post.permalink} target="_blank" rel="noreferrer" aria-label="Открыть в Threads">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Удалить пост"
                      onClick={() => setToDelete(post)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                }
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Удалить пост из Threads?"
        description={
          toDelete?.text ? (
            <span className="line-clamp-3">«{toDelete.text}»</span>
          ) : (
            'Пост исчезнет из Threads вместе с ответами. Отменить нельзя.'
          )
        }
        confirmLabel="Удалить"
        destructive
        pending={remove.isPending}
        onConfirm={async () => {
          if (!toDelete) return
          await remove.mutateAsync({ accountId, threadId: toDelete.id })
          setToDelete(null)
        }}
      />
    </div>
  )
}
