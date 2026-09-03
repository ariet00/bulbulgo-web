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
import { useDebounce, useThreadsRecommendations } from '@doska/shared'
import { Loader2, RefreshCcw, TrendingUp } from 'lucide-react'

import { FeedItemCard } from '@/components/threads/FeedItemCard'

const PAGE_SIZE = 12

// Scraper-collected trends (Patchright collector). Moved verbatim out of
// ThreadsAccountDetail; behaviour intentionally unchanged.
export function TrendsTab({ accountId }: { accountId: number }) {
  const [feedPage, setFeedPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [minLikes, setMinLikes] = useState<number>(0)

  const {
    data: feedData,
    isLoading: isFeedLoading,
    isFetching: isFeedFetching,
    refetch: refetchFeed,
  } = useThreadsRecommendations({
    account_id: accountId,
    skip: (feedPage - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
    sort_by: sortBy,
    order: sortOrder,
    min_likes: minLikes > 0 ? minLikes : undefined,
    q: debouncedSearch || undefined,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Input
              placeholder="Поиск в трендах..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
            <Loader2
              className={`absolute left-3 top-2.5 h-4 w-4 text-muted-foreground ${
                debouncedSearch !== searchQuery || isFeedFetching ? 'animate-spin' : ''
              }`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Min Likes:</span>
            <Input
              type="number"
              value={minLikes}
              onChange={(e) => setMinLikes(parseInt(e.target.value) || 0)}
              className="w-20 h-9 px-2"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="likes">🔥 Engagement</SelectItem>
              <SelectItem value="reposts">🔄 Reposts</SelectItem>
              <SelectItem value="replies">💬 Replies</SelectItem>
              <SelectItem value="created_at">📅 Newest</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="h-9 w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Desc</SelectItem>
              <SelectItem value="asc">Asc</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={() => refetchFeed()} disabled={isFeedFetching}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${isFeedFetching ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {isFeedLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[200px] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : feedData?.items?.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {feedData.items.map((item: any) => (
              <FeedItemCard key={item.id} item={item} />
            ))}
          </div>
          <Pagination
            page={feedPage}
            total={feedData.total}
            size={PAGE_SIZE}
            onPageChange={setFeedPage}
          />
        </>
      ) : (
        <Card className="border-dashed py-20">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-muted p-4 rounded-full">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Трендов пока нет</p>
              <p className="text-muted-foreground">
                Нажмите «Собрать тренды», чтобы начать собирать данные.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
