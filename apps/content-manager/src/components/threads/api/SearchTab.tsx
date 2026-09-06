'use client'

import { useState } from 'react'

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@doska/ui'
import {
  THREADS_SCOPE_KEYWORD_SEARCH,
  THREADS_SEARCH_DAILY_QUERY_LIMIT,
  THREADS_SEARCH_MEDIA_TYPE_LABELS,
  THREADS_SEARCH_MEDIA_TYPES,
  THREADS_SEARCH_MODE_LABELS,
  THREADS_SEARCH_MODES,
  THREADS_SEARCH_TYPE_LABELS,
  THREADS_SEARCH_TYPES,
  THREADS_TEXT_LIMIT,
  useReplyToThread,
  useThreadsRecentKeywords,
  useThreadsSearch,
  type ContentAccount,
  type ThreadsMedia,
  type ThreadsSearchMediaType,
  type ThreadsSearchMode,
  type ThreadsSearchParams,
  type ThreadsSearchType,
} from '@doska/shared'
import { ExternalLink, Loader2, MessageSquare, Search } from 'lucide-react'

import { ReconnectNotice } from '../ReconnectNotice'
import { Segmented } from '../Segmented'
import { ThreadPostItem } from './ThreadPostItem'

const ANY_MEDIA = 'any'
const PAGE = 50

function ReplyBox({
  accountId,
  post,
  onDone,
}: {
  accountId: number
  post: ThreadsMedia
  onDone: () => void
}) {
  const reply = useReplyToThread()
  const [text, setText] = useState('')
  const send = async () => {
    if (!text.trim()) return
    await reply.mutateAsync({ accountId, mediaId: post.id, text: text.trim() })
    onDone()
  }
  return (
    <div className="ml-4 space-y-2 border-l-2 border-brand/40 pl-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={THREADS_TEXT_LIMIT}
        rows={3}
        autoFocus
        placeholder={`Ответ для @${post.username || 'автора'}`}
        className="text-sm"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={reply.isPending}>
          Отмена
        </Button>
        <Button type="button" size="sm" onClick={send} disabled={!text.trim() || reply.isPending}>
          {reply.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Ответить
        </Button>
      </div>
    </div>
  )
}

export function SearchTab({ account }: { account: ContentAccount }) {
  const accountId = account.id
  const [draft, setDraft] = useState('')
  const [searchType, setSearchType] = useState<ThreadsSearchType>('TOP')
  const [searchMode, setSearchMode] = useState<ThreadsSearchMode>('KEYWORD')
  const [mediaType, setMediaType] = useState<string>(ANY_MEDIA)
  // Only a submitted query goes to the API: each call is one of the daily searches.
  const [params, setParams] = useState<ThreadsSearchParams | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const { data, isFetching, isError, error } = useThreadsSearch(accountId, params)
  const { data: recent } = useThreadsRecentKeywords(accountId)
  const results = data?.data || []
  const recentKeywords = recent?.data || []

  const submit = (raw = draft) => {
    const tagged = raw.trim().startsWith('#')
    const q = raw.trim().replace(/^#/, '')
    if (!q) return
    setDraft(q)
    if (tagged) setSearchMode('TAG')
    setReplyingTo(null)
    setParams({
      q,
      search_type: searchType,
      search_mode: tagged ? 'TAG' : searchMode,
      media_type: mediaType === ANY_MEDIA ? undefined : (mediaType as ThreadsSearchMediaType),
      limit: PAGE,
    })
  }

  const errorMessage = (error as any)?.response?.data?.message

  return (
    <div className="space-y-5">
      <ReconnectNotice account={account} scope={THREADS_SCOPE_KEYWORD_SEARCH}>
        Доступ этого аккаунта выдан без права поиска. Переподключите его, чтобы искать по публичным постам.
      </ReconnectNotice>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="space-y-3 rounded-xl border bg-card p-4"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={200}
              placeholder={searchMode === 'TAG' ? 'Тег без решётки, например бишкек' : 'Слово или фраза'}
              className="pl-9"
              aria-label="Поисковый запрос"
            />
          </div>
          <Button type="submit" disabled={!draft.trim() || isFetching}>
            {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Найти
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Segmented
            label="Сортировка"
            options={THREADS_SEARCH_TYPES}
            labels={THREADS_SEARCH_TYPE_LABELS}
            value={searchType}
            onChange={setSearchType}
          />
          <Segmented
            label="Режим поиска"
            options={THREADS_SEARCH_MODES}
            labels={THREADS_SEARCH_MODE_LABELS}
            value={searchMode}
            onChange={setSearchMode}
          />
          <Select value={mediaType} onValueChange={setMediaType}>
            <SelectTrigger className="h-8 w-[150px] text-xs" aria-label="Тип поста">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_MEDIA}>Любой тип</SelectItem>
              {THREADS_SEARCH_MEDIA_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {THREADS_SEARCH_MEDIA_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {recentKeywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>Недавно искали:</span>
            {recentKeywords.slice(0, 8).map((k) => (
              <button
                key={`${k.query}-${k.timestamp}`}
                type="button"
                onClick={() => submit(k.query)}
                className="rounded-full border px-2.5 py-0.5 text-foreground transition-colors hover:border-brand/60"
              >
                {k.query}
              </button>
            ))}
          </div>
        )}
      </form>

      {!params ? (
        <div className="rounded-xl border border-dashed px-6 py-10 text-center">
          <p className="font-medium">Найдите посты по своей теме</p>
          <p className="mx-auto mt-1 max-w-prose text-sm text-muted-foreground">
            Ответьте на чужой пост от имени аккаунта или возьмите идею для своего. Threads даёт до{' '}
            {THREADS_SEARCH_DAILY_QUERY_LIMIT} запросов в сутки на аккаунт.
          </p>
        </div>
      ) : isFetching && !data ? (
        <ul className="space-y-2" aria-busy>
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex gap-3 rounded-lg border bg-card p-3">
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-32" />
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/40 px-6 py-8 text-center">
          <p className="font-medium">Поиск не удался</p>
          <p className="mt-1 text-sm text-muted-foreground">{errorMessage || 'Threads не ответил, попробуйте позже.'}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-10 text-center">
          <p className="font-medium">Ничего не нашли</p>
          <p className="mx-auto mt-1 max-w-prose text-sm text-muted-foreground">
            Пока Meta не одобрила доступ к поиску, он идёт только по вашим постам. Попробуйте другое слово или
            короче.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {results.map((post) => (
            <li key={post.id} className="space-y-2">
              <ThreadPostItem
                post={post}
                showAuthor
                actions={
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-pressed={replyingTo === post.id}
                      onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                    >
                      <MessageSquare className="mr-1.5 h-4 w-4" />
                      Ответить
                    </Button>
                    {post.permalink && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={post.permalink} target="_blank" rel="noreferrer" aria-label="Открыть в Threads">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </>
                }
              />
              {replyingTo === post.id && (
                <ReplyBox accountId={accountId} post={post} onDone={() => setReplyingTo(null)} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
