'use client'

import React, { useState } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@doska/ui'
import {
  useDeleteContentAccount,
  useDeletePageComment,
  useDeletePagePost,
  useHidePageComment,
  usePageInsights,
  usePagePostComments,
  usePagePostInsights,
  usePagePosts,
  usePublishToPage,
  useReplyPageComment,
  type ContentAccount,
  type PageMediaType,
} from '@doska/shared'
import { useRouter } from '@doska/i18n'
import {
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Send,
  Trash2,
} from 'lucide-react'

interface Props {
  account: ContentAccount
}

export function PagesAccountDetail({ account }: Props) {
  const router = useRouter()
  const deleteAccount = useDeleteContentAccount()
  const data = (account.data as Record<string, any>) || {}

  const handleDelete = async () => {
    if (!confirm(`Отключить страницу ${account.username}?`)) return
    await deleteAccount.mutateAsync({
      platform: account.platform,
      accountId: account.id,
    })
    router.push('/')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <Badge className="bg-blue-100 text-blue-700 text-[10px] uppercase">
              Facebook Page
            </Badge>
            <CardTitle className="text-2xl pt-2 flex items-center gap-3">
              {data.picture_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.picture_url}
                  alt=""
                  className="h-10 w-10 rounded-full"
                />
              )}
              {account.display_name || account.username}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  account.is_active ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              {account.is_active ? 'Подключён' : 'Не активен'}
              {data.category && (
                <span className="text-xs uppercase rounded bg-secondary px-1.5 py-0.5">
                  {data.category}
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Отключить
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultValue="composer" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="composer">Композер</TabsTrigger>
          <TabsTrigger value="posts">Посты</TabsTrigger>
          <TabsTrigger value="insights">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="composer" className="mt-4">
          <ComposerTab accountId={account.id} />
        </TabsContent>
        <TabsContent value="posts" className="mt-4">
          <PostsTab accountId={account.id} />
        </TabsContent>
        <TabsContent value="insights" className="mt-4">
          <InsightsTab accountId={account.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ───── Composer ────────────────────────────────────────────────────────────

function ComposerTab({ accountId }: { accountId: number }) {
  const publish = usePublishToPage()
  const [mediaType, setMediaType] = useState<PageMediaType>('TEXT')
  const [message, setMessage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [link, setLink] = useState('')

  const canPublish =
    !publish.isPending &&
    ((mediaType === 'TEXT' && (message || link)) ||
      (mediaType === 'PHOTO' && imageUrl) ||
      (mediaType === 'VIDEO' && videoUrl))

  const handlePublish = async () => {
    await publish.mutateAsync({
      accountId,
      body: {
        media_type: mediaType,
        message: message || undefined,
        image_url: mediaType === 'PHOTO' ? imageUrl : undefined,
        video_url: mediaType === 'VIDEO' ? videoUrl : undefined,
        video_title: mediaType === 'VIDEO' ? videoTitle || undefined : undefined,
        link: mediaType === 'TEXT' ? link || undefined : undefined,
      },
    })
    setMessage('')
    setImageUrl('')
    setVideoUrl('')
    setVideoTitle('')
    setLink('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Новый пост</CardTitle>
        <CardDescription>
          Меди-публикации фейсбук скачает по публичной ссылке.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Тип</Label>
          <Select value={mediaType} onValueChange={(v) => setMediaType(v as PageMediaType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TEXT">Текст (опц. ссылка)</SelectItem>
              <SelectItem value="PHOTO">Фото</SelectItem>
              <SelectItem value="VIDEO">Видео</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mediaType === 'PHOTO' && (
          <div className="space-y-2">
            <Label>Ссылка на изображение</Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…/photo.jpg"
            />
          </div>
        )}

        {mediaType === 'VIDEO' && (
          <>
            <div className="space-y-2">
              <Label>Ссылка на видео</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://…/video.mp4"
              />
            </div>
            <div className="space-y-2">
              <Label>Заголовок (опционально)</Label>
              <Input
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
            </div>
          </>
        )}

        {mediaType === 'TEXT' && (
          <div className="space-y-2">
            <Label>Ссылка (опционально)</Label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://…"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>{mediaType === 'TEXT' ? 'Сообщение' : 'Подпись'}</Label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <Button onClick={handlePublish} disabled={!canPublish} className="w-full">
          {publish.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Опубликовать
        </Button>
      </CardContent>
    </Card>
  )
}

// ───── Posts ───────────────────────────────────────────────────────────────

function PostsTab({ accountId }: { accountId: number }) {
  const { data: posts, isLoading } = usePagePosts(accountId)
  const del = useDeletePagePost()
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const { data: comments, isLoading: commentsLoading } = usePagePostComments(
    selectedPostId ? accountId : null,
    selectedPostId,
  )
  const reply = useReplyPageComment()
  const hide = useHidePageComment()
  const delComment = useDeletePageComment()
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})

  return (
    <div className="grid gap-4 md:grid-cols-[300px,1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Последние посты</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto space-y-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {(posts?.data || []).map((p) => (
            <div
              key={p.id}
              className={`rounded border p-2 cursor-pointer ${
                selectedPostId === p.id ? 'border-primary' : ''
              } hover:bg-muted/50`}
              onClick={() => setSelectedPostId(p.id)}
            >
              <div className="flex gap-2">
                {p.full_picture && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.full_picture}
                    alt=""
                    className="h-12 w-12 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0 text-xs space-y-1">
                  <p className="truncate">
                    {p.message || <span className="italic">без текста</span>}
                  </p>
                  <p className="text-muted-foreground">
                    ❤ {p.reactions?.summary?.total_count ?? 0} · 💬{' '}
                    {p.comments?.summary?.total_count ?? 0} · ↗{' '}
                    {p.shares?.count ?? 0}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-1 mt-2">
                {p.permalink_url && (
                  <a
                    href={p.permalink_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> FB
                  </a>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Удалить пост?')) {
                      del.mutate({ accountId, postId: p.id })
                    }
                  }}
                  className="text-[10px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
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
          <CardTitle className="text-base">Комментарии</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
          {!selectedPostId && (
            <p className="text-sm text-muted-foreground">
              Выберите пост слева, чтобы увидеть его комментарии.
            </p>
          )}
          {commentsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {(comments?.data || []).map((c) => (
            <div key={c.id} className="rounded border p-3 space-y-2 text-sm">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  <strong className="text-foreground">{c.from?.name || 'Anonymous'}</strong>
                  {c.is_hidden && (
                    <span className="ml-2 text-amber-600">(скрыт)</span>
                  )}
                </span>
                <span>{c.created_time?.slice(0, 16)}</span>
              </div>
              <p>{c.message}</p>
              <div className="flex gap-1 text-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    hide.mutate({
                      accountId,
                      commentId: c.id,
                      hide: !c.is_hidden,
                    })
                  }
                >
                  {c.is_hidden ? (
                    <Eye className="h-3 w-3 mr-1" />
                  ) : (
                    <EyeOff className="h-3 w-3 mr-1" />
                  )}
                  {c.is_hidden ? 'Показать' : 'Скрыть'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('Удалить комментарий?')) {
                      delComment.mutate({ accountId, commentId: c.id })
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Удалить
                </Button>
              </div>
              <div className="flex gap-2 pt-1">
                <Input
                  value={replyDrafts[c.id] || ''}
                  onChange={(e) =>
                    setReplyDrafts((d) => ({ ...d, [c.id]: e.target.value }))
                  }
                  placeholder="Ответить от имени Page…"
                  className="text-xs"
                />
                <Button
                  size="sm"
                  disabled={!replyDrafts[c.id]}
                  onClick={async () => {
                    await reply.mutateAsync({
                      accountId,
                      commentId: c.id,
                      message: replyDrafts[c.id],
                    })
                    setReplyDrafts((d) => ({ ...d, [c.id]: '' }))
                  }}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ───── Insights ────────────────────────────────────────────────────────────

function InsightsTab({ accountId }: { accountId: number }) {
  const { data: pageInsights, isLoading } = usePageInsights(accountId)
  const { data: posts } = usePagePosts(accountId)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const { data: postInsights, isLoading: piLoading } = usePagePostInsights(
    selectedPostId ? accountId : null,
    selectedPostId,
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Аналитика страницы</CardTitle>
          <CardDescription>За сутки</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {(pageInsights?.data || []).map((m: any) => (
              <div key={m.name} className="rounded border p-3">
                <p className="text-xs uppercase text-muted-foreground">
                  {m.title || m.name}
                </p>
                <p className="text-xl font-semibold mt-1">
                  {m.values?.[m.values.length - 1]?.value ?? '—'}
                </p>
                {m.description && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {m.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Аналитика поста</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={selectedPostId ?? ''}
            onValueChange={(v) => setSelectedPostId(v || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="— выбрать пост —" />
            </SelectTrigger>
            <SelectContent>
              {(posts?.data || []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {(p.message || p.id).slice(0, 50)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {piLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {postInsights?.data && (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {postInsights.data.map((m: any) => (
                <div key={m.name} className="rounded border p-3">
                  <p className="text-xs uppercase text-muted-foreground">
                    {m.title || m.name}
                  </p>
                  <p className="text-xl font-semibold mt-1">
                    {(() => {
                      const v = m.values?.[0]?.value
                      if (v && typeof v === 'object') {
                        return Object.entries(v)
                          .map(([k, val]) => `${k}: ${val}`)
                          .join(', ')
                      }
                      return v ?? '—'
                    })()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
