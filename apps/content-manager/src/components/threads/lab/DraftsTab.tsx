'use client'

import { useState } from 'react'

import {
  Button,
  Card,
  CardContent,
  Input,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@doska/ui'
import { useDebounce, useThreadsPosts } from '@doska/shared'
import { Loader2, RefreshCcw, Wand2 } from 'lucide-react'

import { PostCard } from '@/components/threads/PostCard'

const PAGE_SIZE = 12

// AI-generated drafts. Moved verbatim out of ThreadsAccountDetail; behaviour
// intentionally unchanged.
export function DraftsTab({ accountId }: { accountId: number }) {
  const [draftPage, setDraftPage] = useState(1)
  const [draftSearchQuery, setDraftSearchQuery] = useState('')
  const debouncedDraftSearch = useDebounce(draftSearchQuery, 500)
  const [draftStatus, setDraftStatus] = useState('all')
  const [draftSortOrder, setDraftSortOrder] = useState('desc')

  const {
    data: draftsData,
    isLoading: isDraftsLoading,
    isFetching: isDraftsFetching,
    refetch: refetchDrafts,
  } = useThreadsPosts({
    account_id: accountId,
    skip: (draftPage - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
    status: draftStatus !== 'all' ? draftStatus : undefined,
    q: debouncedDraftSearch || undefined,
    order: draftSortOrder,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Input
              placeholder="Поиск по постам..."
              value={draftSearchQuery}
              onChange={(e) => setDraftSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
            <Loader2
              className={`absolute left-3 top-2.5 h-4 w-4 text-muted-foreground ${
                debouncedDraftSearch !== draftSearchQuery || isDraftsFetching ? 'animate-spin' : ''
              }`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={draftStatus} onValueChange={setDraftStatus}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="draft">📝 Черновик</SelectItem>
              <SelectItem value="approved">✅ Утверждён</SelectItem>
              <SelectItem value="published">🚀 Опубликован</SelectItem>
              <SelectItem value="error">❌ Ошибка</SelectItem>
            </SelectContent>
          </Select>

          <Select value={draftSortOrder} onValueChange={setDraftSortOrder}>
            <SelectTrigger className="h-9 w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Новые</SelectItem>
              <SelectItem value="asc">Старые</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={() => refetchDrafts()} disabled={isDraftsFetching}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${isDraftsFetching ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {isDraftsLoading ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[250px] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : draftsData?.items?.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {draftsData.items.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            page={draftPage}
            total={draftsData.total}
            size={PAGE_SIZE}
            onPageChange={setDraftPage}
          />
        </>
      ) : (
        <Card className="border-dashed py-20">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-muted p-4 rounded-full">
              <Wand2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Черновиков пока нет</p>
              <p className="text-muted-foreground">
                Нажмите «Сгенерировать пост», чтобы создать черновики через AI.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
