'use client'

import { useState } from 'react'

import { Button, Input, Pagination, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@doska/ui'
import {
  cn,
  THREADS_TREND_SORT_LABELS,
  THREADS_TREND_SORTS,
  threadsCollectorKeywords,
  useDebounce,
  useThreadsRecommendations,
  type ContentAccount,
  type ThreadsTrendSort,
} from '@doska/shared'
import { Loader2, RefreshCcw, Search, Settings2, TrendingUp } from 'lucide-react'

import { FeedItemCard } from '@/components/threads/FeedItemCard'

const PAGE_SIZE = 12
const ALL = 'all'

/** Posts the keyword-search collector found; ranked by Meta's TOP order. */
export function TrendsTab({ account, onOpenSettings }: { account: ContentAccount; onOpenSettings: () => void }) {
  const keywords = threadsCollectorKeywords(account)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [sortBy, setSortBy] = useState<ThreadsTrendSort>('score')
  const [keyword, setKeyword] = useState<string>(ALL)

  const { data, isLoading, isFetching, refetch } = useThreadsRecommendations({
    account_id: account.id,
    skip: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
    sort_by: sortBy,
    order: 'desc',
    q: debouncedSearch || undefined,
    query: keyword === ALL ? undefined : keyword,
  })
  const items = data?.items || []

  const pickKeyword = (next: string) => {
    setKeyword(next)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по собранным постам"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
            aria-label="Поиск по трендам"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as ThreadsTrendSort)}>
            <SelectTrigger className="h-9 w-[160px]" aria-label="Сортировка">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THREADS_TREND_SORTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {THREADS_TREND_SORT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')} />
            Обновить
          </Button>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs" role="group" aria-label="Ключевое слово">
          {[ALL, ...keywords].map((kw) => {
            const value = kw === ALL ? ALL : kw.replace(/^#/, '')
            const active = keyword === value
            return (
              <button
                key={kw}
                type="button"
                aria-pressed={active}
                onClick={() => pickKeyword(value)}
                className={cn(
                  'rounded-full border px-2.5 py-1 transition-colors',
                  active ? 'border-brand bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {kw === ALL ? 'Все' : kw}
              </button>
            )
          })}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <FeedItemCard key={item.id} item={item} />
            ))}
          </div>
          <Pagination page={page} total={data?.total || 0} size={PAGE_SIZE} onPageChange={setPage} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-16 text-center">
          <span className="rounded-full bg-muted p-4">
            {isFetching ? (
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            ) : (
              <TrendingUp className="h-7 w-7 text-muted-foreground" />
            )}
          </span>
          {keywords.length === 0 ? (
            <>
              <div>
                <p className="font-medium">Сначала задайте ключевые слова</p>
                <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                  Коллектор ищет публичные посты Threads по вашим темам и тегам, а генератор берёт из них идеи.
                </p>
              </div>
              <Button variant="outline" onClick={onOpenSettings}>
                <Settings2 className="mr-2 h-4 w-4" />
                Открыть настройки
              </Button>
            </>
          ) : (
            <div>
              <p className="font-medium">{debouncedSearch || keyword !== ALL ? 'Ничего не нашли' : 'Трендов пока нет'}</p>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                {debouncedSearch || keyword !== ALL
                  ? 'Смените фильтр или запрос.'
                  : 'Нажмите «Собрать тренды» вверху страницы: результаты появятся здесь через минуту.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
