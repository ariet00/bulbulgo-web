'use client'

import React, { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@doska/ui'
import {
  useThreadMediaInsights,
  useThreadsAccountInsights,
  useUserThreads,
} from '@doska/shared'
import { Loader2 } from 'lucide-react'

export function ThreadsInsightsTab({ accountId }: { accountId: number }) {
  const { data: account, isLoading } = useThreadsAccountInsights(accountId)
  const { data: threads } = useUserThreads(accountId)
  const [mediaId, setMediaId] = useState<string | null>(null)
  const { data: media, isLoading: mediaLoading } = useThreadMediaInsights(
    mediaId ? accountId : null,
    mediaId,
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Аналитика аккаунта</CardTitle>
          <CardDescription>Метрики Threads</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {(account?.data || []).map((m: any) => (
              <div key={m.name} className="rounded border p-3">
                <p className="text-xs uppercase text-muted-foreground">
                  {m.title || m.name}
                </p>
                <p className="text-xl font-semibold mt-1">
                  {m.total_value?.value ??
                    m.values?.[m.values.length - 1]?.value ??
                    '—'}
                </p>
                {m.description && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {m.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Аналитика поста</CardTitle>
          <CardDescription>Выберите пост</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={mediaId ?? ''} onValueChange={(v) => setMediaId(v || null)}>
            <SelectTrigger>
              <SelectValue placeholder="— выбрать —" />
            </SelectTrigger>
            <SelectContent>
              {(threads?.data || []).map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {(t.text || t.media_type || t.id).slice(0, 50)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {mediaLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {media?.data && (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {media.data.map((m: any) => (
                <div key={m.name} className="rounded border p-3">
                  <p className="text-xs uppercase text-muted-foreground">
                    {m.title || m.name}
                  </p>
                  <p className="text-xl font-semibold mt-1">
                    {m.values?.[0]?.value ??
                      m.total_value?.value ??
                      '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
