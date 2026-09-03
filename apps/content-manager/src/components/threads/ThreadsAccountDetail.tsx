'use client'

import { useState } from 'react'

import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@doska/ui'
import { useCollectThreadsData, useGenerateThreadsDrafts, type ContentAccount } from '@doska/shared'
import { Loader2, RefreshCcw, Wand2 } from 'lucide-react'

import { ComposerTab } from './api/ComposerTab'
import { InsightsTab } from './api/InsightsTab'
import { PostsTab } from './api/PostsTab'
import { RepliesTab } from './api/RepliesTab'
import { DraftsTab } from './lab/DraftsTab'
import { LogsTab } from './lab/LogsTab'
import { PersonaSettingsTab } from './lab/PersonaSettingsTab'
import { TrendsTab } from './lab/TrendsTab'
import { ThreadsHeader } from './ThreadsHeader'

// First group talks to the official Threads API (what App Review sees);
// second group is the trend scraper + AI drafts pipeline (kept as is).
const API_TABS = [
  { value: 'compose', label: 'Публикация' },
  { value: 'posts', label: 'Посты' },
  { value: 'replies', label: 'Ответы' },
  { value: 'insights', label: 'Статистика' },
] as const
const LAB_TABS = [
  { value: 'trends', label: 'Тренды' },
  { value: 'drafts', label: 'Драфты' },
  { value: 'settings', label: 'Настройки' },
  { value: 'logs', label: 'Логи' },
] as const

type TabValue = (typeof API_TABS)[number]['value'] | (typeof LAB_TABS)[number]['value']

const triggerClass =
  'rounded-md px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=active]:ring-1 data-[state=active]:ring-border'

export function ThreadsAccountDetail({ account }: { account: ContentAccount }) {
  const accountId = account.id
  const [tab, setTab] = useState<TabValue>('compose')
  // A post chosen in one tab (e.g. "Ответы" on a post) is opened in the next.
  const [focusMediaId, setFocusMediaId] = useState<string | null>(null)

  const collect = useCollectThreadsData()
  const generate = useGenerateThreadsDrafts()

  const openWith = (next: TabValue, mediaId: string | null = null) => {
    setFocusMediaId(mediaId)
    setTab(next)
  }

  return (
    <div className="space-y-6">
      <ThreadsHeader
        account={account}
        actions={
          <>
            <Button variant="outline" onClick={() => collect.mutate(accountId)} disabled={collect.isPending}>
              {collect.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Собрать тренды
            </Button>
            <Button variant="outline" onClick={() => generate.mutate(accountId)} disabled={generate.isPending}>
              {generate.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Сгенерировать пост
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="w-full">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="h-auto w-max justify-start gap-0.5 bg-secondary p-1">
            {API_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className={triggerClass}>
                {t.label}
              </TabsTrigger>
            ))}
            <span aria-hidden className="mx-1.5 h-5 w-px bg-border" />
            {LAB_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className={triggerClass}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="compose" className="mt-6">
          <ComposerTab account={account} onPublished={() => openWith('posts')} />
        </TabsContent>
        <TabsContent value="posts" className="mt-6">
          <PostsTab
            accountId={accountId}
            onOpenReplies={(id) => openWith('replies', id)}
            onOpenInsights={(id) => openWith('insights', id)}
            onCompose={() => openWith('compose')}
          />
        </TabsContent>
        <TabsContent value="replies" className="mt-6">
          <RepliesTab accountId={accountId} initialMediaId={focusMediaId} />
        </TabsContent>
        <TabsContent value="insights" className="mt-6">
          <InsightsTab accountId={accountId} initialMediaId={focusMediaId} />
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <TrendsTab accountId={accountId} />
        </TabsContent>
        <TabsContent value="drafts" className="mt-6">
          <DraftsTab accountId={accountId} />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <PersonaSettingsTab account={account} />
        </TabsContent>
        <TabsContent value="logs" className="mt-6">
          <LogsTab accountId={accountId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
