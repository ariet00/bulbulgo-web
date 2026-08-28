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
  Textarea,
} from '@doska/ui'
import { Download, RefreshCw, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { exportAudience } from '@/apis/audiences'
import { SourceListEditor } from '@/components/audiences/SourceListEditor'
import {
  useAddAudienceItems,
  useRecollectAudience,
  useUpdateAudience,
} from '@/hooks/mutations'
import { useAccounts, useAudienceItems, useAudienceReach, useMeta } from '@/hooks/queries'
import type { Audience, AudienceSourceInput } from '@/types'

const PAGE_SIZE = 100
const NO_FILTER = 'all'
/** Modes that walk message history rather than a member list. */
const HISTORY_MODES = ['writers', 'channel_comments', 'channel_discussion']

interface Props {
  audience: Audience
}

/** The base itself: what's inside, what already happened to it, how to fill it.
 *  Rendered as its own screen (`/audiences/[id]`). */
export function AudienceDetail({ audience }: Props) {
  const { data: meta } = useMeta()
  const addItems = useAddAudienceItems()
  const update = useUpdateAudience()
  const recollect = useRecollectAudience()
  const { data: accounts } = useAccounts({ status: 'active', size: 200 })
  const fileRef = useRef<HTMLInputElement>(null)

  const [page, setPage] = useState(1)
  const [flagFilter, setFlagFilter] = useState(NO_FILTER)
  const [raw, setRaw] = useState('')
  const [sources, setSources] = useState<AudienceSourceInput[]>([])
  const [collectAccount, setCollectAccount] = useState('')
  const [collectLimit, setCollectLimit] = useState('')
  const [collectMessagesLimit, setCollectMessagesLimit] = useState('')
  const [collectSinceDays, setCollectSinceDays] = useState('')

  const perRunCap = meta?.max_collect_per_run ?? 10000
  const scanCap = meta?.max_scan_per_run ?? 10000
  const defaultMessageScan = meta?.default_writers_message_scan ?? 5000

  // Reset the editable source list whenever a different base is opened.
  useEffect(() => {
    setSources((audience?.sources ?? []).map((s) => ({ target: s.target, mode: s.type })))
  }, [audience?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!collectAccount && accounts?.items[0]) setCollectAccount(String(accounts.items[0].id))
  }, [accounts, collectAccount])

  // Prefill the per-run amount with the cap; the operator can lower it.
  useEffect(() => {
    if (!collectLimit && meta?.max_collect_per_run) {
      setCollectLimit(String(meta.max_collect_per_run))
    }
  }, [meta, collectLimit])

  const filters =
    flagFilter === NO_FILTER ? {} : { has_flags: Number(flagFilter) }
  const { data } = useAudienceItems(audience.id, {
    page,
    size: PAGE_SIZE,
    ...filters,
  })
  const { data: reach } = useAudienceReach(audience.id)

  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))
  const collecting = ['running', 'scheduled'].includes(audience.collect?.status ?? '')
  const editableSources = sources.length ? sources : [{ target: '', mode: 'members' }]

  /** Names of every flag set on an entry — its work history in one line. */
  const flagLabels = (flags: number) =>
    (meta?.audience_flags ?? [])
      .filter((flag) => (flags & flag.value) !== 0)
      .map((flag) => flag.label)

  return (
    <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Записей: {audience.items_count}
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <div className="text-sm font-medium">Группы базы</div>
            <SourceListEditor value={editableSources} onChange={setSources} />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={update.isPending}
                onClick={() =>
                  update.mutate({
                    id: audience.id,
                    sources: sources
                      .map((s) => ({ target: s.target.trim(), mode: s.mode }))
                      .filter((s) => s.target),
                  })
                }
              >
                Сохранить группы
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Input
                    className="w-24"
                    inputMode="numeric"
                    aria-label="Сколько новых собрать за раз"
                    title="Сколько новых собрать за раз"
                    value={collectLimit}
                    onChange={(e) => setCollectLimit(e.target.value.replace(/\D/g, ''))}
                  />
                  <span className="text-xs text-muted-foreground">новых за раз</span>
                </div>
                <Select value={collectAccount} onValueChange={setCollectAccount}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="аккаунт" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.items.map((account) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.username ? `@${account.username}` : account.phone || account.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={
                    !collectAccount ||
                    collecting ||
                    recollect.isPending ||
                    sources.every((s) => !s.target.trim())
                  }
                  onClick={() =>
                    recollect.mutate({
                      id: audience.id,
                      account_id: Number(collectAccount),
                      limit: Math.min(Number(collectLimit) || perRunCap, perRunCap),
                      messages_limit: collectMessagesLimit ? Number(collectMessagesLimit) : null,
                      since_days: collectSinceDays ? Number(collectSinceDays) : null,
                    })
                  }
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Собрать новых
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              «Собрать новых» переобходит группы и добавляет только тех, кого в базе ещё нет:
              лимит считает именно новых, не больше {perRunCap.toLocaleString('ru-RU')} за
              заход. Уже собранные тратят не лимит, а обход — за раз аккаунт просматривает
              не больше {scanCap.toLocaleString('ru-RU')} человек, дальше повторный заход.
            </p>
            {editableSources.some((s) => HISTORY_MODES.includes(s.mode)) && (
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <Label htmlFor="recollect-messages" className="text-xs">
                    Сообщений просмотреть
                  </Label>
                  <Input
                    id="recollect-messages"
                    className="w-36"
                    inputMode="numeric"
                    placeholder={`по умолчанию ${defaultMessageScan.toLocaleString('ru-RU')}`}
                    value={collectMessagesLimit}
                    onChange={(e) =>
                      setCollectMessagesLimit(e.target.value.replace(/\D/g, ''))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="recollect-since" className="text-xs">
                    …или за последние, дней
                  </Label>
                  <Input
                    id="recollect-since"
                    className="w-32"
                    inputMode="numeric"
                    placeholder="без ограничения"
                    value={collectSinceDays}
                    onChange={(e) => setCollectSinceDays(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Режимы «писавшие»/«комментаторы» без этих полей смотрят только последние{' '}
                  {defaultMessageScan.toLocaleString('ru-RU')} сообщений группы — новых
                  писавших за пределами этого окна досбор не увидит.
                </p>
              </div>
            )}
            {collecting && (
              <p className="text-xs text-muted-foreground">
                Идёт сбор… собрано {audience.collect?.collected ?? 0}
              </p>
            )}
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
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  По сообщению — любому аккаунту, который видит исходный чат
                </span>
                <span>{reach.with_message}</span>
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
                Люди без логина адресуются либо сохранённым доступом (только тот
                аккаунт, который их собрал), либо ссылкой на их сообщение — а она
                годится любому аккаунту, который видит исходный чат. Поэтому сбор
                «Писавшие в группе» даёт куда более пригодную базу, чем «Участники».
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
                    (item.has_message_ref ? (
                      <span
                        className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400"
                        title="Есть ссылка на его сообщение — доступен любому аккаунту, который видит чат"
                      >
                        по сообщению
                      </span>
                    ) : item.hash_accounts.length ? (
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
  )
}
