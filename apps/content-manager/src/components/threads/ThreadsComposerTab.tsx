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
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@doska/ui'
import {
  usePublishToThreads,
  type ThreadsCarouselItem,
  type ThreadsMediaType,
} from '@doska/shared'
import { Loader2, Plus, X } from 'lucide-react'

export function ThreadsComposerTab({ accountId }: { accountId: number }) {
  const publish = usePublishToThreads()
  const [mediaType, setMediaType] = useState<ThreadsMediaType>('TEXT')
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [carouselItems, setCarouselItems] = useState<ThreadsCarouselItem[]>([
    { image_url: '' },
    { image_url: '' },
  ])

  const canPublish =
    !publish.isPending &&
    ((mediaType === 'TEXT' && text.trim()) ||
      (mediaType === 'IMAGE' && imageUrl) ||
      (mediaType === 'VIDEO' && videoUrl) ||
      (mediaType === 'CAROUSEL' &&
        carouselItems.length >= 2 &&
        carouselItems.every((i) => i.image_url || i.video_url)))

  const handlePublish = async () => {
    await publish.mutateAsync({
      accountId,
      body: {
        media_type: mediaType,
        text: text || undefined,
        image_url: mediaType === 'IMAGE' ? imageUrl : undefined,
        video_url: mediaType === 'VIDEO' ? videoUrl : undefined,
        carousel_items: mediaType === 'CAROUSEL' ? carouselItems : undefined,
      },
    })
    setText('')
    setImageUrl('')
    setVideoUrl('')
    setCarouselItems([{ image_url: '' }, { image_url: '' }])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Новый пост в Threads</CardTitle>
        <CardDescription>
          Прямая публикация через официальный Threads API. Для медиа — публичный
          URL.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Тип</Label>
          <Select
            value={mediaType}
            onValueChange={(v) => setMediaType(v as ThreadsMediaType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TEXT">Текст</SelectItem>
              <SelectItem value="IMAGE">Фото</SelectItem>
              <SelectItem value="VIDEO">Видео</SelectItem>
              <SelectItem value="CAROUSEL">Карусель (2-20)</SelectItem>
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

        {mediaType === 'VIDEO' && (
          <div className="space-y-2">
            <Label>Ссылка на видео</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://…/video.mp4"
            />
          </div>
        )}

        {mediaType === 'CAROUSEL' && (
          <div className="space-y-3">
            <Label>Элементы карусели</Label>
            {carouselItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={item.image_url || ''}
                  onChange={(e) =>
                    setCarouselItems((arr) =>
                      arr.map((it, i) =>
                        i === idx ? { ...it, image_url: e.target.value } : it,
                      ),
                    )
                  }
                  placeholder={`#${idx + 1}: https://…/photo.jpg`}
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
            {carouselItems.length < 20 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCarouselItems((arr) => [...arr, { image_url: '' }])
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Добавить
              </Button>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>{mediaType === 'TEXT' ? 'Текст' : 'Подпись'}</Label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            maxLength={500}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="До 500 символов"
          />
          <p className="text-xs text-muted-foreground text-right">
            {text.length}/500
          </p>
        </div>

        <Button onClick={handlePublish} disabled={!canPublish} className="w-full">
          {publish.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Опубликовать
        </Button>
      </CardContent>
    </Card>
  )
}
