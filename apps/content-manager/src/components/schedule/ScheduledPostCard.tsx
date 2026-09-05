'use client'

import { useState } from 'react'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@doska/ui'
import {
  cn,
  SCHEDULED_POST_EDITABLE,
  SCHEDULED_POST_STATUS_LABELS,
  useCancelScheduledPost,
  useDeleteScheduledPost,
  usePublishScheduledPostNow,
  useUpdateScheduledPost,
  type ScheduledPost,
} from '@doska/shared'
import { ExternalLink, MoreHorizontal } from 'lucide-react'

import { PlatformMark } from '@/components/accounts/PlatformMark'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { formatDateTime, formatRelative } from '@/lib/format'

import { ScheduleDialog } from './ScheduleDialog'
import { STATUS_DOT } from './scheduleStatus'

export function ScheduledPostCard({ post, compact }: { post: ScheduledPost; compact?: boolean }) {
  const editable = SCHEDULED_POST_EDITABLE.includes(post.status)
  const update = useUpdateScheduledPost()
  const cancel = useCancelScheduledPost()
  const publishNow = usePublishScheduledPostNow()
  const remove = useDeleteScheduledPost()
  const [reschedule, setReschedule] = useState(false)
  const [confirm, setConfirm] = useState<'cancel' | 'delete' | 'now' | null>(null)

  const text = post.content.text || ''
  const media = post.content.media || []
  const permalink = post.data?.permalink as string | undefined

  return (
    <article className={cn('space-y-3 rounded-xl border bg-card p-4', post.status === 'cancelled' && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <PlatformMark platform={post.account.platform} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">@{post.account.username}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(post.scheduled_at)}
            {post.status === 'scheduled' && `, ${formatRelative(post.scheduled_at)}`}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[post.status])} />
          {SCHEDULED_POST_STATUS_LABELS[post.status]}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-2 -mt-1 h-8 w-8" aria-label="Действия">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {editable && (
              <>
                <DropdownMenuItem onSelect={() => setReschedule(true)}>Перенести</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setConfirm('now')}>Опубликовать сейчас</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setConfirm('cancel')}>Отменить публикацию</DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {permalink && (
              <DropdownMenuItem asChild>
                <a href={permalink} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Открыть пост
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              disabled={post.status === 'publishing'}
              onSelect={() => setConfirm('delete')}
            >
              Удалить из планировщика
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className={cn('whitespace-pre-wrap break-words text-sm', compact ? 'line-clamp-3' : 'line-clamp-6', !text && 'italic text-muted-foreground')}>
        {text || 'Без текста'}
      </p>

      {media.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto">
          {media.map((m, i) =>
            m.kind === 'video' ? (
              <video key={i} src={m.url} muted className="h-14 w-14 shrink-0 rounded-md object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={m.url} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
            ),
          )}
        </div>
      )}

      {post.status === 'failed' && post.error && (
        <p className="rounded-md bg-destructive/5 p-2 text-xs text-destructive">
          {post.error}
          {post.attempts > 1 && ` (попыток: ${post.attempts})`}
        </p>
      )}
      {post.status === 'scheduled' && post.attempts > 0 && post.next_attempt_at && (
        <p className="text-xs text-muted-foreground">
          Попытка {post.attempts} не удалась, повтор {formatRelative(post.next_attempt_at)}
        </p>
      )}

      <ScheduleDialog
        open={reschedule}
        onOpenChange={setReschedule}
        title="Перенести публикацию"
        confirmLabel="Перенести"
        initialAt={post.scheduled_at}
        pending={update.isPending}
        onConfirm={async (iso, timezone) => {
          await update.mutateAsync({ id: post.id, body: { scheduled_at: iso, timezone } })
          setReschedule(false)
        }}
      />
      <ConfirmDialog
        open={confirm === 'now'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Опубликовать прямо сейчас?"
        description="Пост уйдёт в соцсеть в течение минуты, время из плана больше не действует."
        confirmLabel="Опубликовать"
        pending={publishNow.isPending}
        onConfirm={async () => {
          await publishNow.mutateAsync(post.id)
          setConfirm(null)
        }}
      />
      <ConfirmDialog
        open={confirm === 'cancel'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Отменить публикацию?"
        description="Пост останется в планировщике со статусом «Отменён», его можно удалить позже."
        confirmLabel="Отменить публикацию"
        destructive
        pending={cancel.isPending}
        onConfirm={async () => {
          await cancel.mutateAsync(post.id)
          setConfirm(null)
        }}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Удалить из планировщика?"
        description={
          post.status === 'published'
            ? 'Запись исчезнет из планировщика. Сам пост в соцсети останется.'
            : 'Пост не будет опубликован и исчезнет из планировщика.'
        }
        confirmLabel="Удалить"
        destructive
        pending={remove.isPending}
        onConfirm={async () => {
          await remove.mutateAsync(post.id)
          setConfirm(null)
        }}
      />
    </article>
  )
}
