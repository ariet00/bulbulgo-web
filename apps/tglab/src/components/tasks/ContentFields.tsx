'use client'

import { Input, Label, Switch, Textarea } from '@doska/ui'

import type { MessageContentInput } from '@/types'

interface Props {
  value: MessageContentInput
  onChange: (value: MessageContentInput) => void
}

/** The message a broadcast carries — own text (with Spintax) or a repost. */
export function ContentFields({ value, onChange }: Props) {
  const patch = (fields: Partial<MessageContentInput>) => onChange({ ...value, ...fields })
  const isRepost = Boolean(value.repost)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="is-repost">Репост поста из канала</Label>
        <Switch
          id="is-repost"
          checked={isRepost}
          onCheckedChange={(checked) =>
            patch({ repost: checked ? { chat: '', message_id: 0 } : null })
          }
        />
      </div>

      {isRepost ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="repost-chat">Канал</Label>
              <Input
                id="repost-chat"
                placeholder="@channel"
                value={value.repost?.chat ?? ''}
                onChange={(e) =>
                  patch({ repost: { ...value.repost!, chat: e.target.value } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repost-id">ID поста</Label>
              <Input
                id="repost-id"
                inputMode="numeric"
                value={value.repost?.message_id || ''}
                onChange={(e) =>
                  patch({
                    repost: {
                      ...value.repost!,
                      message_id: Number(e.target.value.replace(/\D/g, '')) || 0,
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="hide-author">Скрыть автора</Label>
            <Switch
              id="hide-author"
              checked={Boolean(value.hide_author)}
              onCheckedChange={(checked) => patch({ hide_author: checked })}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="content-text">Сообщение</Label>
            <Textarea
              id="content-text"
              rows={5}
              placeholder={'{Привет|Здравствуй}, %username%!'}
              value={value.text ?? ''}
              onChange={(e) => patch({ text: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Spintax <code>{'{вариант1|вариант2}'}</code> подставляет случайный
              вариант, <code>%username%</code>, <code>%name%</code> и{' '}
              <code>%id%</code> — данные получателя.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content-image">Ссылка на картинку</Label>
            <Input
              id="content-image"
              placeholder="https://…"
              value={value.image_url ?? ''}
              onChange={(e) => patch({ image_url: e.target.value || null })}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="silent">Без звука</Label>
        <Switch
          id="silent"
          checked={Boolean(value.silent)}
          onCheckedChange={(checked) => patch({ silent: checked })}
        />
      </div>
    </div>
  )
}
