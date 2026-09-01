'use client'

import { cn } from '@doska/shared'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@doska/ui'
import { Download, RefreshCw, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { exportAudience } from '@/apis/audiences'
import { SourceListEditor } from '@/components/audiences/SourceListEditor'
import { useAddAudienceItems, useRecollectAudience, useUpdateAudience } from '@/hooks/mutations'
import { useAccounts, useAudienceItems, useAudienceReach, useMeta } from '@/hooks/queries'
import type { Audience, AudienceSourceInput } from '@/types'

const PAGE_SIZE = 100
const NO_FILTER = 'all'
/** Modes that walk message history rather than a member list. */
const HISTORY_MODES = ['writers', 'channel_comments', 'channel_discussion']

/** Reachability tiers, best to worst — the same colour stands for the same
 *  meaning in the summary bars above and the per-row badges below. */
const REACH_TONE = {
  username: { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  message: { bar: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400' },
  unreachable: { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
} as const

interface Props {
  audience: Audience
}

/** One metric as a share of the base: number, percent, a single-colour bar.
 *  The three shares aren't mutually exclusive (an entry can have both a login
 *  and a message ref), so this is three independent reads, not one stacked
 *  bar — stacking them would imply a split that isn't real. */
function ReachStat({
  label,
  hint,
  count,
  total,
  tone,
}: {
  label: string
  hint: string
  count: number
  total: number
  tone: keyof typeof REACH_TONE
}) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1.5" title={hint}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn('text-sm font-medium tabular-nums', REACH_TONE[tone].text)}>
          {count.toLocaleString('ru-RU')}
          <span className="ml-1 text-xs font-normal text-muted-foreground">{pct}%</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', REACH_TONE[tone].bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
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

  const filters = flagFilter === NO_FILTER ? {} : { has_flags: Number(flagFilter) }
  const { data } = useAudienceItems(audience.id, {
    page,
    size: PAGE_SIZE,
    ...filters,
  })
  const { data: reach } = useAudienceReach(audience.id)

  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))
  const collecting = ['running', 'scheduled'].includes(audience.collect?.status ?? '')
  const editableSources = sources.length ? sources : [{ target: '', mode: 'members' }]
  const hasHistorySource = editableSources.some((s) => HISTORY_MODES.includes(s.mode))

  /** Names of every flag set on an entry — its work history in one line. */
  const flagLabels = (flags: number) =>
    (meta?.audience_flags ?? [])
      .filter((flag) => (flags & flag.value) !== 0)
      .map((flag) => flag.label)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Группы базы</CardTitle>
          <CardDescription>
            {audience.items_count.toLocaleString('ru-RU')} записей
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SourceListEditor value={editableSources} onChange={setSources} />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Досбор</CardTitle>
          <CardDescription>
            Переобходит те же группы и добавляет только тех, кого в базе ещё нет
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="collect-account" className="text-xs">
                Аккаунт-сборщик
              </Label>
              <Select value={collectAccount} onValueChange={setCollectAccount}>
                <SelectTrigger id="collect-account">
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
            </div>
            <div className="space-y-1">
              <Label htmlFor="collect-limit" className="text-xs">
                Новых записей за раз
              </Label>
              <Input
                id="collect-limit"
                inputMode="numeric"
                value={collectLimit}
                onChange={(e) => setCollectLimit(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Не больше {perRunCap.toLocaleString('ru-RU')} новых за заход; уже собранные ничего
            не стоят — тратится только обзор, до {scanCap.toLocaleString('ru-RU')} человек за
            раз.
          </p>

          {hasHistorySource && (
            <div className="space-y-3 border-t pt-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="collect-messages" className="text-xs">
                    Сообщений просмотреть
                  </Label>
                  <Input
                    id="collect-messages"
                    inputMode="numeric"
                    placeholder={defaultMessageScan.toLocaleString('ru-RU')}
                    value={collectMessagesLimit}
                    onChange={(e) =>
                      setCollectMessagesLimit(e.target.value.replace(/\D/g, ''))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="collect-since" className="text-xs">
                    …или дней назад
                  </Label>
                  <Input
                    id="collect-since"
                    inputMode="numeric"
                    placeholder="любой срок"
                    value={collectSinceDays}
                    onChange={(e) => setCollectSinceDays(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                «Писавшие»/«комментаторы» без этих полей смотрят только последние{' '}
                {defaultMessageScan.toLocaleString('ru-RU')} сообщений группы — новых писавших
                за пределами этого окна досбор не увидит.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
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
            {collecting && (
              <p className="text-xs text-muted-foreground">
                Идёт сбор… собрано {audience.collect?.collected ?? 0}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {reach && (
        <Card>
          <CardHeader>
            <CardTitle>Доступность</CardTitle>
            <CardDescription>Кому можно писать без нового сбора</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ReachStat
                label="По логину"
                hint="Есть @username — обратиться может любой аккаунт"
                count={reach.with_username}
                total={reach.total}
                tone="username"
              />
              <ReachStat
                label="По сообщению"
                hint="Есть ссылка на сообщение — обратиться может любой аккаунт, который видит исходный чат"
                count={reach.with_message}
                total={reach.total}
                tone="message"
              />
              <ReachStat
                label="Недостижимы"
                hint="Ни логина, ни доступа, ни сообщения — обратиться нельзя, пока не пересоберёте"
                count={reach.unreachable}
                total={reach.total}
                tone="unreachable"
              />
            </div>

            {reach.accounts.length > 0 && (
              <div className="space-y-1.5 border-t pt-3">
                <div className="text-xs font-medium text-muted-foreground">
                  Сохранённый доступ — годится только тому, кто собирал
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {reach.accounts.map((entry) => (
                    <Badge key={entry.account_id} variant="outline" className="font-normal">
                      {entry.label}
                      <span className="ml-1 tabular-nums text-muted-foreground">
                        {entry.items}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Добавить вручную</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
                addItems.mutate({ id: audience.id, raw }, { onSuccess: () => setRaw('') })
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>Записи</CardTitle>
          <Select
            value={flagFilter}
            onValueChange={(value) => {
              setFlagFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-48">
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
        </CardHeader>
        <CardContent className="space-y-3 px-0">
          <div className="overflow-x-auto px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Запись</TableHead>
                  <TableHead className="text-right">История</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {item.username ? `@${item.username}` : item.tg_user_id}
                        {!item.username &&
                          (item.has_message_ref ? (
                            <Badge
                              className="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                              variant="outline"
                              title="Есть ссылка на его сообщение — доступен любому аккаунту, который видит чат"
                            >
                              по сообщению
                            </Badge>
                          ) : item.hash_accounts.length ? (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground"
                              title="Доступен аккаунтам, которые его собрали"
                            >
                              есть доступ
                            </Badge>
                          ) : (
                            <Badge
                              className="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              variant="outline"
                              title="Ни логина, ни сохранённого доступа — обратиться к нему нельзя"
                            >
                              только id
                            </Badge>
                          ))}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {flagLabels(item.flags).join(', ') ||
                        (item.cycles ? `циклов: ${item.cycles}` : '—')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data && data.items.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">Записей нет.</div>
            )}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between px-4">
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
        </CardContent>
      </Card>
    </div>
  )
}
