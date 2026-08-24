'use client'

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Textarea,
} from '@doska/ui'
import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import { exportAudience } from '@/apis/audiences'
import { useAddAudienceItems } from '@/hooks/mutations'
import { useAudienceItems, useAudienceReach, useMeta } from '@/hooks/queries'
import type { Audience } from '@/types'

const PAGE_SIZE = 100
const NO_FILTER = 'all'

interface Props {
  audience: Audience | null
  onOpenChange: (open: boolean) => void
}

/** The base itself: what's inside, what already happened to it, how to fill it. */
export function AudienceSheet({ audience, onOpenChange }: Props) {
  const { data: meta } = useMeta()
  const addItems = useAddAudienceItems()
  const fileRef = useRef<HTMLInputElement>(null)

  const [page, setPage] = useState(1)
  const [flagFilter, setFlagFilter] = useState(NO_FILTER)
  const [raw, setRaw] = useState('')

  const filters =
    flagFilter === NO_FILTER ? {} : { has_flags: Number(flagFilter) }
  const { data } = useAudienceItems(audience?.id ?? null, {
    page,
    size: PAGE_SIZE,
    ...filters,
  })
  const { data: reach } = useAudienceReach(audience?.id ?? null)

  if (!audience) return null

  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  /** Names of every flag set on an entry — its work history in one line. */
  const flagLabels = (flags: number) =>
    (meta?.audience_flags ?? [])
      .filter((flag) => (flags & flag.value) !== 0)
      .map((flag) => flag.label)

  return (
    <Sheet open={Boolean(audience)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{audience.name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 p-4">
          <div className="text-sm text-muted-foreground">
            Записей: {audience.items_count}
            {audience.source?.target ? ` · источник ${audience.source.target}` : ''}
          </div>

          {reach && (
            <div className="space-y-2 rounded-md border p-3">
              <div className="text-sm font-medium">Кому база доступна</div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  С логином — доступны любому аккаунту
                </span>
                <span>{reach.with_username}</span>
              </div>
              {reach.accounts.map((entry) => (
                <div key={entry.account_id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    По сохранённому доступу — {entry.label}
                  </span>
                  <span>{entry.items}</span>
                </div>
              ))}
              {reach.unreachable > 0 && (
                <div className="flex justify-between text-sm text-amber-600 dark:text-amber-400">
                  <span>Ни логина, ни доступа — недостижимы</span>
                  <span>{reach.unreachable}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Telegram выдаёт доступ к человеку каждому аккаунту отдельно. Записи
                без логина видит только тот аккаунт, который их собрал — пересоберите
                базу нужным аккаунтом либо включите в задаче «Прогревать по исходному
                чату».
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Label>Добавить вручную</Label>
            <Textarea
              rows={4}
              placeholder={'@login\n123456789\nhttps://t.me/login'}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={!raw.trim() || addItems.isPending}
                onClick={() =>
                  addItems.mutate(
                    { id: audience.id, raw },
                    { onSuccess: () => setRaw('') },
                  )
                }
              >
                Добавить
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) addItems.mutate({ id: audience.id, file })
                  e.target.value = ''
                }}
              />
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-1 h-4 w-4" />
                Файлом
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportAudience(audience.id, 'txt', filters)}
              >
                <Download className="mr-1 h-4 w-4" />
                Выгрузить txt
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportAudience(audience.id, 'csv', filters)}
              >
                <Download className="mr-1 h-4 w-4" />
                csv
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Показать</Label>
            <Select
              value={flagFilter}
              onValueChange={(value) => {
                setFlagFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_FILTER}>Все записи</SelectItem>
                {(meta?.audience_flags ?? []).map((flag) => (
                  <SelectItem key={flag.value} value={String(flag.value)}>
                    {flag.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            {data?.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  {item.username ? `@${item.username}` : item.tg_user_id}
                  {!item.username &&
                    (item.hash_accounts.length ? (
                      <span
                        className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        title="Доступен аккаунтам, которые его собрали"
                      >
                        есть доступ
                      </span>
                    ) : (
                      <span
                        className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600 dark:text-amber-400"
                        title="Ни логина, ни сохранённого доступа — обратиться к нему нельзя"
                      >
                        только id
                      </span>
                    ))}
                </span>
                <span className="text-xs text-muted-foreground">
                  {flagLabels(item.flags).join(', ') ||
                    (item.cycles ? `циклов: ${item.cycles}` : '—')}
                </span>
              </div>
            ))}
            {data && data.items.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Записей нет.
              </div>
            )}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Назад
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {pages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Вперёд
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
