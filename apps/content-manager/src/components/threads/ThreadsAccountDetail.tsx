'use client'

import { useState } from 'react'

import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@doska/ui'
import {
  threadsCollectorKeywords,
  useCollectThreadsData,
  useGenerateThreadsDrafts,
  useThreadsGenerationPreview,
  type ContentAccount,
} from '@doska/shared'
import { useRouter } from '@doska/i18n'
import { Loader2, RefreshCcw, Unplug, Wand2 } from 'lucide-react'
import { toast } from 'sonner'

import { DeleteAccountDialog } from '@/components/accounts/DeleteAccountDialog'

import { ComposerTab } from './api/ComposerTab'
import { InsightsTab } from './api/InsightsTab'
import { PostsTab } from './api/PostsTab'
import { RepliesTab } from './api/RepliesTab'
import { SearchTab } from './api/SearchTab'
import { DraftsTab } from './lab/DraftsTab'
import { LogsTab } from './lab/LogsTab'
import { PersonaSettingsTab } from './lab/PersonaSettingsTab'
import { TrendsTab } from './lab/TrendsTab'
import { ThreadsHeader } from './ThreadsHeader'

// First group talks to the official Threads API (what App Review sees);
// second group is the lab: keyword-search trend collector + AI drafts.
const API_TABS = [
  { value: 'compose', label: 'Публикация' },
  { value: 'posts', label: 'Посты' },
  { value: 'search', label: 'Поиск' },
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
  const router = useRouter()
  const [tab, setTab] = useState<TabValue>('compose')
  const [disconnectOpen, setDisconnectOpen] = useState(false)
  // A post chosen in one tab (e.g. "Ответы" on a post) is opened in the next.
  const [focusMediaId, setFocusMediaId] = useState<string | null>(null)

  const collect = useCollectThreadsData()
  const generate = useGenerateThreadsDrafts()
  const { data: preview } = useThreadsGenerationPreview(accountId)

  // The backend refuses to generate without a complete persona; send the
  // person to the settings instead of letting the task fail in the logs.
  const handleGenerate = () => {
    if (preview && !preview.can_generate) {
      toast.error(preview.blockers[0] || 'Заполните персону в настройках')
      setTab('settings')
      return
    }
    generate.mutate(accountId)
  }

  // The collector searches by the account's keywords; without them the task only logs an error.
  const handleCollect = () => {
    if (threadsCollectorKeywords(account).length === 0) {
      toast.error('Добавьте ключевые слова для сбора трендов в настройках')
      setTab('settings')
      return
    }
    collect.mutate(accountId)
  }

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
            <Button variant="outline" onClick={handleCollect} disabled={collect.isPending}>
              {collect.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Собрать тренды
            </Button>
            <Button variant="outline" onClick={handleGenerate} disabled={generate.isPending}>
              {generate.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Сгенерировать пост
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setDisconnectOpen(true)}
            >
              <Unplug className="mr-2 h-4 w-4" />
              Отключить
            </Button>
          </>
        }
      />

      <DeleteAccountDialog
        account={account}
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
        onDeleted={() => router.push('/')}
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
        <TabsContent value="search" className="mt-6">
          <SearchTab account={account} />
        </TabsContent>
        <TabsContent value="replies" className="mt-6">
          <RepliesTab accountId={accountId} initialMediaId={focusMediaId} />
        </TabsContent>
        <TabsContent value="insights" className="mt-6">
          <InsightsTab accountId={accountId} initialMediaId={focusMediaId} />
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <TrendsTab account={account} onOpenSettings={() => openWith('settings')} />
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
