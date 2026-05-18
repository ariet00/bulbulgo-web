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
  useDeleteInstagramComment,
  useHideInstagramComment,
  useInstagramAccountInsights,
  useInstagramConversationMessages,
  useInstagramConversations,
  useInstagramMedia,
  useInstagramMediaComments,
  useInstagramMediaInsights,
  usePublishToInstagram,
  useReplyInstagramComment,
  useSendInstagramMessage,
  type ContentAccount,
  type InstagramMediaType,
  type InstagramCarouselItem,
} from '@doska/shared'
import { useRouter } from '@doska/i18n'
import {
  ExternalLink,
  EyeOff,
  Eye,
  Loader2,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react'

interface Props {
  account: ContentAccount
}

export function InstagramAccountDetail({ account }: Props) {
  const router = useRouter()
  const deleteAccount = useDeleteContentAccount()

  const data = (account.data as Record<string, any>) || {}
  const igUserId = data.ig_user_id as string | undefined
  const accountType = data.account_type as string | undefined

  const handleDelete = async () => {
    if (!confirm(`Отключить аккаунт @${account.username}?`)) return
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
            <Badge className="bg-pink-100 text-pink-700 text-[10px] uppercase">
              Instagram
            </Badge>
            <CardTitle className="text-2xl pt-2">
              {account.display_name || `@${account.username}`}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  account.is_active ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              {account.is_active ? 'Подключён' : 'Не активен'}
              {accountType && (
                <span className="text-xs uppercase rounded bg-secondary px-1.5 py-0.5">
                  {accountType}
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
        {(data.followers_count !== undefined || data.media_count !== undefined) && (
          <CardContent className="grid grid-cols-2 gap-4 pt-0">
            {data.followers_count !== undefined && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">Подписчики</p>
                <p className="text-lg font-semibold">{data.followers_count}</p>
              </div>
            )}
            {data.media_count !== undefined && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">Постов</p>
                <p className="text-lg font-semibold">{data.media_count}</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="composer" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="composer">Композер</TabsTrigger>
          <TabsTrigger value="comments">Комментарии</TabsTrigger>
          <TabsTrigger value="inbox">Direct</TabsTrigger>
          <TabsTrigger value="insights">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="composer" className="mt-4">
          <ComposerTab accountId={account.id} disabled={!igUserId} />
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <CommentsTab accountId={account.id} disabled={!igUserId} />
        </TabsContent>

        <TabsContent value="inbox" className="mt-4">
          <InboxTab accountId={account.id} disabled={!igUserId} />
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <InsightsTab accountId={account.id} disabled={!igUserId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ───── Composer ────────────────────────────────────────────────────────────

function ComposerTab({ accountId, disabled }: { accountId: number; disabled: boolean }) {
  const publish = usePublishToInstagram()
  const [mediaType, setMediaType] = useState<InstagramMediaType>('IMAGE')
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [carouselItems, setCarouselItems] = useState<InstagramCarouselItem[]>([
    { image_url: '' },
    { image_url: '' },
  ])

  const updateItem = (idx: number, patch: InstagramCarouselItem) =>
    setCarouselItems((items) =>
      items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    )

  const canPublish =
    !disabled &&
    !publish.isPending &&
    ((mediaType === 'IMAGE' && imageUrl) ||
      (mediaType === 'VIDEO' && videoUrl) ||
      (mediaType === 'REELS' && videoUrl) ||
      (mediaType === 'CAROUSEL' &&
        carouselItems.length >= 2 &&
        carouselItems.every((i) => i.image_url || i.video_url)))

  const handlePublish = async () => {
    await publish.mutateAsync({
      accountId,
      body: {
        media_type: mediaType,
        caption: caption || undefined,
        image_url: mediaType === 'IMAGE' ? imageUrl : undefined,
        video_url: mediaType === 'VIDEO' || mediaType === 'REELS' ? videoUrl : undefined,
        cover_url: mediaType === 'REELS' ? coverUrl || undefined : undefined,
        carousel_items: mediaType === 'CAROUSEL' ? carouselItems : undefined,
      },
    })
    setCaption('')
    setImageUrl('')
    setVideoUrl('')
    setCoverUrl('')
    setCarouselItems([{ image_url: '' }, { image_url: '' }])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новая публикация</CardTitle>
        <CardDescription>
          Instagram скачивает медиа по публичной ссылке. Загрузите файл в наше
          хранилище и вставьте сюда полученный URL.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Тип публикации</Label>
          <Select
            value={mediaType}
            onValueChange={(v) => setMediaType(v as InstagramMediaType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IMAGE">Фото</SelectItem>
              <SelectItem value="VIDEO">Видео</SelectItem>
              <SelectItem value="REELS">Reels</SelectItem>
              <SelectItem value="CAROUSEL">Карусель (2-10 элементов)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mediaType === 'IMAGE' && (
          <div className="space-y-2">
            <Label>Ссылка на изображение</Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…/photo.jpg"
            />
          </div>
        )}

        {(mediaType === 'VIDEO' || mediaType === 'REELS') && (
          <>
            <div className="space-y-2">
              <Label>Ссылка на видео</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://…/video.mp4"
              />
            </div>
            {mediaType === 'REELS' && (
              <div className="space-y-2">
                <Label>Ссылка на обложку (опционально)</Label>
                <Input
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://…/cover.jpg"
                />
              </div>
            )}
          </>
        )}

        {mediaType === 'CAROUSEL' && (
          <div className="space-y-3">
            <Label>Элементы карусели</Label>
            {carouselItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={item.image_url || ''}
                  onChange={(e) => updateItem(idx, { image_url: e.target.value })}
                  placeholder={`Элемент ${idx + 1}: https://…/photo.jpg`}
                  className="flex-1"
                />
                {carouselItems.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setCarouselItems((arr) => arr.filter((_, i) => i !== idx))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {carouselItems.length < 10 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCarouselItems((arr) => [...arr, { image_url: '' }])
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Добавить элемент
              </Button>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Подпись</Label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Текст с эмодзи, хэштегами…"
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

// ───── Comments ────────────────────────────────────────────────────────────

function CommentsTab({ accountId, disabled }: { accountId: number; disabled: boolean }) {
  const { data: mediaResp, isLoading: mediaLoading } = useInstagramMedia(
    disabled ? null : accountId,
  )
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)
  const { data: commentsResp, isLoading: commentsLoading } =
    useInstagramMediaComments(selectedMediaId ? accountId : null, selectedMediaId)

  const reply = useReplyInstagramComment()
  const hide = useHideInstagramComment()
  const del = useDeleteInstagramComment()

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})

  return (
    <div className="grid gap-4 md:grid-cols-[260px,1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Посты</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto space-y-2">
          {mediaLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {(mediaResp?.data || []).map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMediaId(m.id)}
              className={`flex w-full gap-2 text-left p-2 rounded border ${
                selectedMediaId === m.id ? 'border-primary' : 'border-transparent'
              } hover:bg-muted/50`}
            >
              <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                {(m.thumbnail_url || m.media_url) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.thumbnail_url || m.media_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="text-xs space-y-0.5 min-w-0">
                <p className="truncate">
                  {m.caption || <span className="italic">без подписи</span>}
                </p>
                <p className="text-muted-foreground">
                  {m.media_type} · 💬 {m.comments_count ?? 0} · ❤ {m.like_count ?? 0}
                </p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Комментарии</CardTitle>
          {selectedMediaId && (
            <a
              href={(mediaResp?.data || []).find((m) => m.id === selectedMediaId)?.permalink}
              target="_blank"
              rel="noreferrer"
              className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="h-3 w-3" /> Открыть в IG
            </a>
          )}
        </CardHeader>
        <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
          {!selectedMediaId && (
            <p className="text-sm text-muted-foreground">
              Выберите пост слева, чтобы посмотреть его комментарии.
            </p>
          )}
          {commentsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {(commentsResp?.data || []).map((c) => (
            <div key={c.id} className="rounded border p-3 space-y-2 text-sm">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  <strong className="text-foreground">@{c.username}</strong>
                  {c.hidden && (
                    <span className="ml-2 text-amber-600">(скрыт)</span>
                  )}
                </span>
                <span>{c.timestamp?.slice(0, 16)}</span>
              </div>
              <p>{c.text}</p>
              <div className="flex gap-1 text-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    hide.mutate({
                      accountId,
                      commentId: c.id,
                      hide: !c.hidden,
                    })
                  }
                >
                  {c.hidden ? (
                    <Eye className="h-3 w-3 mr-1" />
                  ) : (
                    <EyeOff className="h-3 w-3 mr-1" />
                  )}
                  {c.hidden ? 'Показать' : 'Скрыть'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('Удалить комментарий?')) {
                      del.mutate({ accountId, commentId: c.id })
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
                  placeholder="Ответить…"
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

// ───── Inbox (Direct) ──────────────────────────────────────────────────────

function InboxTab({ accountId, disabled }: { accountId: number; disabled: boolean }) {
  const { data: conversations, isLoading } = useInstagramConversations(
    disabled ? null : accountId,
  )
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { data: messages } = useInstagramConversationMessages(
    selectedId ? accountId : null,
    selectedId,
  )
  const send = useSendInstagramMessage()
  const [draft, setDraft] = useState('')

  const handleSend = async () => {
    if (!selectedId || !draft.trim()) return
    await send.mutateAsync({
      accountId,
      conversationId: selectedId,
      body: { text: draft.trim() },
    })
    setDraft('')
  }

  return (
    <div className="grid gap-4 md:grid-cols-[260px,1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Диалоги</CardTitle>
          <CardDescription className="text-xs">
            Сообщения приходят через webhook
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto space-y-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!conversations?.length && !isLoading && (
            <p className="text-sm text-muted-foreground">Пока нет диалогов.</p>
          )}
          {(conversations || []).map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full text-left p-2 rounded ${
                selectedId === c.id ? 'bg-muted' : ''
              } hover:bg-muted/50`}
            >
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium truncate">
                  @{c.participant_username || c.participant_ig_id}
                </span>
                {c.unread_count > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-[10px]">
                    {c.unread_count}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {c.last_message_preview || '…'}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-base">
            {selectedId ? 'Переписка' : 'Выберите диалог'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3 max-h-[60vh]">
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {(messages || []).map((m) => (
              <div
                key={m.id}
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  m.direction === 'outbound'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {m.body || (
                  <span className="italic text-xs opacity-60">[вложение]</span>
                )}
                <div className="text-[10px] opacity-60 mt-0.5">
                  {m.sent_at.slice(11, 16)}
                </div>
              </div>
            ))}
          </div>
          {selectedId && (
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Сообщение…"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend} disabled={send.isPending || !draft.trim()}>
                {send.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ───── Insights ────────────────────────────────────────────────────────────

function InsightsTab({ accountId, disabled }: { accountId: number; disabled: boolean }) {
  const { data: account, isLoading: accLoading } = useInstagramAccountInsights(
    disabled ? null : accountId,
  )
  const [mediaId, setMediaId] = useState<string | null>(null)
  const { data: mediaList } = useInstagramMedia(disabled ? null : accountId)
  const { data: media, isLoading: mediaLoading } = useInstagramMediaInsights(
    mediaId ? accountId : null,
    mediaId,
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Аналитика аккаунта</CardTitle>
          <CardDescription>Метрики за последние сутки</CardDescription>
        </CardHeader>
        <CardContent>
          {accLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {(account?.data || []).map((metric: any) => (
              <div key={metric.name} className="rounded border p-3">
                <p className="text-xs uppercase text-muted-foreground">
                  {metric.title || metric.name}
                </p>
                <p className="text-xl font-semibold mt-1">
                  {metric.total_value?.value ??
                    metric.values?.[0]?.value ??
                    '—'}
                </p>
                {metric.description && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {metric.description}
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
          <CardDescription>Выберите пост из списка</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={mediaId ?? ''} onValueChange={(v) => setMediaId(v || null)}>
            <SelectTrigger>
              <SelectValue placeholder="— выбрать пост —" />
            </SelectTrigger>
            <SelectContent>
              {(mediaList?.data || []).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {(m.caption || m.id).slice(0, 50)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {mediaLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {media?.data && (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {media.data.map((metric: any) => (
                <div key={metric.name} className="rounded border p-3">
                  <p className="text-xs uppercase text-muted-foreground">
                    {metric.title || metric.name}
                  </p>
                  <p className="text-xl font-semibold mt-1">
                    {metric.values?.[0]?.value ??
                      metric.total_value?.value ??
                      '—'}
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
