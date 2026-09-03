'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@doska/ui'
import {
  cn,
  THREADS_CAROUSEL_MAX,
  THREADS_IMAGE_MAX_BYTES,
  THREADS_TEXT_LIMIT,
  THREADS_VIDEO_MAX_BYTES,
  uploadFile,
  usePublishToThreads,
  useUserThreads,
  type ContentAccount,
  type ThreadsMediaType,
} from '@doska/shared'
import { ImagePlus, Loader2, Video, X } from 'lucide-react'
import { toast } from 'sonner'

interface Attachment {
  id: string
  kind: 'image' | 'video'
  name: string
  previewUrl: string
  /** Public URL once uploaded; the post is sent with these. */
  url?: string
  status: 'uploading' | 'ready' | 'error'
}

const NO_REPLY = 'none'
const IMAGE_TYPES = ['image/jpeg', 'image/png']
const VIDEO_TYPES = ['video/mp4', 'video/quicktime']

function describeMediaType(t: ThreadsMediaType): string {
  return { TEXT: 'Текстовый пост', IMAGE: 'Пост с фото', VIDEO: 'Пост с видео', CAROUSEL: 'Карусель' }[t]
}

export function ComposerTab({
  account,
  onPublished,
}: {
  account: ContentAccount
  onPublished?: () => void
}) {
  const accountId = account.id
  const publish = usePublishToThreads()
  const { data: myThreads } = useUserThreads(accountId)

  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [replyTo, setReplyTo] = useState<string>(NO_REPLY)
  const imageInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)

  // Object URLs are only for the preview; release them when the strip changes.
  useEffect(() => {
    return () => attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mediaType: ThreadsMediaType = useMemo(() => {
    if (attachments.length === 0) return 'TEXT'
    if (attachments.length === 1) return attachments[0].kind === 'video' ? 'VIDEO' : 'IMAGE'
    return 'CAROUSEL'
  }, [attachments])

  const uploading = attachments.some((a) => a.status === 'uploading')
  const failed = attachments.some((a) => a.status === 'error')
  const remaining = THREADS_TEXT_LIMIT - text.length
  const hasContent = text.trim().length > 0 || attachments.length > 0

  const blocker = !hasContent
    ? 'Напишите текст или добавьте фото'
    : uploading
      ? 'Дождитесь загрузки файлов'
      : failed
        ? 'Уберите файлы, которые не загрузились'
        : remaining < 0
          ? 'Сократите текст'
          : null

  const addFiles = async (files: FileList | null, kind: 'image' | 'video') => {
    if (!files?.length) return
    const room = THREADS_CAROUSEL_MAX - attachments.length
    const picked = Array.from(files).slice(0, Math.max(room, 0))
    if (picked.length < files.length) {
      toast.error(`В одном посте не больше ${THREADS_CAROUSEL_MAX} файлов`)
    }
    for (const file of picked) {
      const okType = (kind === 'image' ? IMAGE_TYPES : VIDEO_TYPES).includes(file.type)
      const okSize = file.size <= (kind === 'image' ? THREADS_IMAGE_MAX_BYTES : THREADS_VIDEO_MAX_BYTES)
      if (!okType) {
        toast.error(`${file.name}: нужен ${kind === 'image' ? 'JPEG или PNG' : 'MP4 или MOV'}`)
        continue
      }
      if (!okSize) {
        toast.error(`${file.name}: слишком большой файл`)
        continue
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const item: Attachment = {
        id,
        kind,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        status: 'uploading',
      }
      setAttachments((list) => [...list, item])
      try {
        const fd = new FormData()
        fd.append('file', file)
        // Threads fetches media by URL, so the object must be public.
        const { url } = await uploadFile(fd, true)
        setAttachments((list) => list.map((a) => (a.id === id ? { ...a, url, status: 'ready' } : a)))
      } catch {
        toast.error(`${file.name}: не удалось загрузить`)
        setAttachments((list) => list.map((a) => (a.id === id ? { ...a, status: 'error' } : a)))
      }
    }
  }

  const removeAttachment = (id: string) =>
    setAttachments((list) => {
      const gone = list.find((a) => a.id === id)
      if (gone) URL.revokeObjectURL(gone.previewUrl)
      return list.filter((a) => a.id !== id)
    })

  const reset = () => {
    setText('')
    attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl))
    setAttachments([])
    setReplyTo(NO_REPLY)
  }

  const handlePublish = async () => {
    if (blocker) return
    const ready = attachments.filter((a) => a.status === 'ready' && a.url)
    await publish.mutateAsync({
      accountId,
      body: {
        media_type: mediaType,
        text: text.trim() || undefined,
        image_url: mediaType === 'IMAGE' ? ready[0]?.url : undefined,
        video_url: mediaType === 'VIDEO' ? ready[0]?.url : undefined,
        carousel_items:
          mediaType === 'CAROUSEL'
            ? ready.map((a) => (a.kind === 'video' ? { video_url: a.url } : { image_url: a.url }))
            : undefined,
        reply_to_id: replyTo !== NO_REPLY ? replyTo : undefined,
      },
    })
    reset()
    onPublished?.()
  }

  const avatar = account.data?.threads_profile_picture_url as string | undefined
  const name = account.display_name || account.username

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Editor */}
      <section className="space-y-5 rounded-xl border bg-card p-5">
        <div className="space-y-2">
          <Label htmlFor="threads-text">Текст</Label>
          <Textarea
            id="threads-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={THREADS_TEXT_LIMIT}
            rows={6}
            placeholder="О чём расскажете?"
            className="resize-y text-base leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{describeMediaType(mediaType)}</span>
            <span className={cn(remaining < 40 && 'text-destructive')}>
              {remaining} из {THREADS_TEXT_LIMIT}
            </span>
          </div>
        </div>

        {attachments.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Вложения">
            {attachments.map((a) => (
              <li key={a.id} className="group relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                {a.kind === 'video' ? (
                  <video src={a.previewUrl} muted className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.previewUrl} alt={a.name} className="h-full w-full object-cover" />
                )}
                {a.status === 'uploading' && (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </span>
                )}
                {a.status === 'error' && (
                  <span className="absolute inset-x-0 bottom-0 bg-destructive px-1 py-0.5 text-center text-[10px] text-white">
                    ошибка
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(a.id)}
                  aria-label={`Убрать ${a.name}`}
                  className="absolute right-1 top-1 rounded-full bg-background/90 p-0.5 text-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={imageInput}
            type="file"
            accept={IMAGE_TYPES.join(',')}
            multiple
            hidden
            onChange={(e) => {
              void addFiles(e.target.files, 'image')
              e.target.value = ''
            }}
          />
          <input
            ref={videoInput}
            type="file"
            accept={VIDEO_TYPES.join(',')}
            hidden
            onChange={(e) => {
              void addFiles(e.target.files, 'video')
              e.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => imageInput.current?.click()}
            disabled={attachments.length >= THREADS_CAROUSEL_MAX}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Фото
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => videoInput.current?.click()}
            disabled={attachments.length >= THREADS_CAROUSEL_MAX}
          >
            <Video className="mr-2 h-4 w-4" />
            Видео
          </Button>
          <span className="text-xs text-muted-foreground">
            JPEG или PNG до 8 МБ, MP4 или MOV до 5 минут. Два и больше файлов станут каруселью.
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="threads-reply-to">В ответ на свой пост</Label>
          <Select value={replyTo} onValueChange={setReplyTo}>
            <SelectTrigger id="threads-reply-to" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_REPLY}>Не отвечать, обычный пост</SelectItem>
              {(myThreads?.data || []).map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {(t.text || t.media_type || t.id).slice(0, 60)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <p className="text-xs text-muted-foreground">{blocker ?? 'Пост появится в Threads сразу'}</p>
          <Button onClick={handlePublish} disabled={!!blocker || publish.isPending}>
            {publish.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Опубликовать
          </Button>
        </div>
      </section>

      {/* Preview */}
      <aside className="space-y-3">
        <p className="text-xs text-muted-foreground">Так пост увидят в Threads</p>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex gap-3">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                {name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-semibold leading-9">{account.username}</p>
              {text ? (
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{text}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground">Текст поста</p>
              )}
              {attachments.length === 1 && (
                <div className="overflow-hidden rounded-lg border">
                  {attachments[0].kind === 'video' ? (
                    <video src={attachments[0].previewUrl} controls muted className="max-h-72 w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={attachments[0].previewUrl} alt="" className="max-h-72 w-full object-cover" />
                  )}
                </div>
              )}
              {attachments.length > 1 && (
                <div className="-mr-4 flex gap-2 overflow-x-auto pb-1">
                  {attachments.map((a) => (
                    <div key={a.id} className="h-40 w-32 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      {a.kind === 'video' ? (
                        <video src={a.previewUrl} muted className="h-full w-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.previewUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {replyTo !== NO_REPLY && (
                <p className="text-xs text-muted-foreground">Ответ на ваш пост</p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
