'use client'

import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@doska/ui'

import { ContentFields } from '@/components/tasks/ContentFields'
import { useMeta } from '@/hooks/queries'
import type { MessageContentInput } from '@/types'

type Params = Record<string, any>

interface Props {
  taskType: string
  value: Params
  onChange: (value: Params) => void
}

/** Settings of the chosen tool. Every value set comes from `/tglab/meta`. */
export function TaskParamsForm({ taskType, value, onChange }: Props) {
  const { data: meta } = useMeta()
  const patch = (fields: Params) => onChange({ ...value, ...fields })
  const content: MessageContentInput = value.content ?? {}

  if (taskType === 'inviting') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invite-chat">Куда приглашать</Label>
          <Input
            id="invite-chat"
            placeholder="@chatname"
            value={value.chat ?? ''}
            onChange={(e) => patch({ chat: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Режим</Label>
          <Select
            value={value.mode ?? 'default'}
            onValueChange={(mode) => patch({ mode })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(meta?.invite_modes ?? []).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            «Через админку» нужен, когда обычные участники приглашать не могут:
            главный аккаунт выдаёт рабочим право приглашать.
          </p>
        </div>
        {value.mode === 'admin' && (
          <div className="flex items-center justify-between">
            <Label htmlFor="anonymous">Скрывать рабочие аккаунты в админах</Label>
            <Switch
              id="anonymous"
              checked={Boolean(value.anonymous)}
              onCheckedChange={(anonymous) => patch({ anonymous })}
            />
          </div>
        )}
        <div className="rounded-md bg-muted p-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="warm">Прогревать по исходному чату</Label>
            <Switch
              id="warm"
              checked={Boolean(value.warm_from_source)}
              onCheckedChange={(warm_from_source) => patch({ warm_from_source })}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Нужно, если базу собирал один аккаунт, а работают другие: Telegram
            выдаёт доступ к человеку каждому аккаунту отдельно. Аккаунт один раз
            за тик пройдёт по участникам исходного чата — он должен в нём
            состоять. Если база собрана теми же аккаунтами, включать не нужно.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="auto-stop">Автостоп при выбытии, % аккаунтов</Label>
          <Input
            id="auto-stop"
            inputMode="numeric"
            placeholder="10–90, пусто — без автостопа"
            value={value.auto_stop_pct ?? ''}
            onChange={(e) =>
              patch({
                auto_stop_pct: e.target.value
                  ? Number(e.target.value.replace(/\D/g, ''))
                  : null,
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="group-pct">Доля от группы в день, %</Label>
            <Input
              id="group-pct"
              inputMode="numeric"
              placeholder="по умолчанию 5"
              value={
                value.group_invite_percent != null
                  ? Math.round(value.group_invite_percent * 100)
                  : ''
              }
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '')
                patch({ group_invite_percent: digits ? Number(digits) / 100 : null })
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-cap">Потолок группы в день</Label>
            <Input
              id="group-cap"
              inputMode="numeric"
              placeholder="по умолчанию 150"
              value={value.group_invite_daily_cap ?? ''}
              onChange={(e) =>
                patch({
                  group_invite_daily_cap: e.target.value
                    ? Number(e.target.value.replace(/\D/g, ''))
                    : null,
                })
              }
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Инвайты в один чат в день ограничены его размером — не больше доли участников
          и не больше абсолютного потолка (по умолчанию 5% и 150 — рекомендация
          tglab.pro против флага на сам чат). Если чат маленький и лимит задачи не
          выбирается, поднимите долю/потолок здесь — до 50% и 1000 соответственно.
        </p>
      </div>
    )
  }

  if (taskType === 'sending') {
    return (
      <div className="space-y-4">
        <ContentFields value={content} onChange={(next) => patch({ content: next })} />
        <div className="flex items-center justify-between">
          <Label htmlFor="delete-dialog">Удалять диалог после отправки</Label>
          <Switch
            id="delete-dialog"
            checked={Boolean(value.delete_dialog)}
            onCheckedChange={(delete_dialog) => patch({ delete_dialog })}
          />
        </div>
        <div className="rounded-md bg-muted p-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="warm">Прогревать по исходному чату</Label>
            <Switch
              id="warm"
              checked={Boolean(value.warm_from_source)}
              onCheckedChange={(warm_from_source) => patch({ warm_from_source })}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Нужно, если базу собирал один аккаунт, а работают другие: Telegram
            выдаёт доступ к человеку каждому аккаунту отдельно. Аккаунт один раз
            за тик пройдёт по участникам исходного чата — он должен в нём
            состоять. Если база собрана теми же аккаунтами, включать не нужно.
          </p>
        </div>
      </div>
    )
  }

  if (taskType === 'sending_chats') {
    return (
      <div className="space-y-4">
        <ContentFields value={content} onChange={(next) => patch({ content: next })} />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="cycles">Циклов по базе</Label>
            <Input
              id="cycles"
              inputMode="numeric"
              value={value.cycles ?? 1}
              onChange={(e) =>
                patch({ cycles: Number(e.target.value.replace(/\D/g, '')) || 1 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Если аккаунт в бане чата</Label>
            <Select
              value={value.on_ban ?? 'skip'}
              onValueChange={(on_ban) => patch({ on_ban })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(meta?.on_ban_modes ?? []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  if (taskType === 'mentions') {
    const mode = value.mode ?? 'story'
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Способ</Label>
          <Select value={mode} onValueChange={(next) => patch({ mode: next })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(meta?.mention_modes ?? []).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Нужны Premium-аккаунты — иначе Telegram не даст публиковать истории.
          </p>
        </div>

        {mode === 'repost' ? (
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="story-peer">Чей аккаунт/канал</Label>
              <Input
                id="story-peer"
                placeholder="@channel"
                value={value.source?.peer ?? ''}
                onChange={(e) =>
                  patch({ source: { ...(value.source ?? {}), peer: e.target.value } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="story-id">ID истории</Label>
              <Input
                id="story-id"
                inputMode="numeric"
                value={value.source?.story_id ?? ''}
                onChange={(e) =>
                  patch({
                    source: {
                      ...(value.source ?? {}),
                      story_id: Number(e.target.value.replace(/\D/g, '')) || 0,
                    },
                  })
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="story-image">Ссылка на картинку</Label>
            <Input
              id="story-image"
              placeholder="https://…"
              value={value.image_url ?? ''}
              onChange={(e) => patch({ image_url: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="story-caption">Подпись</Label>
          <Textarea
            id="story-caption"
            rows={3}
            placeholder={mode === 'tag' ? 'Смотри тут {URL}' : 'Подпись истории'}
            value={value.caption ?? ''}
            onChange={(e) => patch({ caption: e.target.value })}
          />
          {mode === 'tag' && (
            <p className="text-xs text-muted-foreground">
              В подписи обязателен <code>{'{URL}'}</code> — на его место встанет
              случайная ссылка из списка.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="story-urls">Ссылки, по одной на строку</Label>
          <Textarea
            id="story-urls"
            rows={3}
            value={(value.urls ?? []).join('\n')}
            onChange={(e) =>
              patch({ urls: e.target.value.split('\n').map((u) => u.trim()).filter(Boolean) })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="per-story">Отметок в одной истории</Label>
          <Input
            id="per-story"
            inputMode="numeric"
            value={value.mentions_per_story ?? 5}
            onChange={(e) =>
              patch({
                mentions_per_story: Number(e.target.value.replace(/\D/g, '')) || 1,
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Одна история — одно действие по лимиту, но отмечает сразу несколько
            человек.
          </p>
        </div>
        <div className="rounded-md bg-muted p-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="warm">Прогревать по исходному чату</Label>
            <Switch
              id="warm"
              checked={Boolean(value.warm_from_source)}
              onCheckedChange={(warm_from_source) => patch({ warm_from_source })}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Нужно, если базу собирал один аккаунт, а работают другие: Telegram
            выдаёт доступ к человеку каждому аккаунту отдельно. Аккаунт один раз
            за тик пройдёт по участникам исходного чата — он должен в нём
            состоять. Если база собрана теми же аккаунтами, включать не нужно.
          </p>
        </div>
      </div>
    )
  }

  return (
    <p className="text-sm text-muted-foreground">
      У этого инструмента нет отдельных настроек.
    </p>
  )
}
