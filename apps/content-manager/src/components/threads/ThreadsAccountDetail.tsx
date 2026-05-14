'use client'

import React, { useEffect, useState } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@doska/ui'
import {
  useCollectThreadsData,
  useDebounce,
  useGenerateThreadsDrafts,
  useThreadsLogs,
  useThreadsPosts,
  useThreadsRecommendations,
  useUpdateContentAccount,
  type ContentAccount,
} from '@doska/shared'
import {
  AlertCircle,
  ClipboardList,
  FileText,
  Loader2,
  RefreshCcw,
  Save,
  Settings,
  TrendingUp,
  Wand2,
} from 'lucide-react'

import { FeedItemCard } from '@/components/threads/FeedItemCard'
import { PostCard } from '@/components/threads/PostCard'

interface Props {
  account: ContentAccount
}

export function ThreadsAccountDetail({ account }: Props) {
  const accountId = account.id

  // Pagination
  const [feedPage, setFeedPage] = useState(1)
  const [draftPage, setDraftPage] = useState(1)
  const [logPage, setLogPage] = useState(1)
  const pageSize = 12

  // Trends filters
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [minLikes, setMinLikes] = useState<number>(0)

  // Drafts filters
  const [draftSearchQuery, setDraftSearchQuery] = useState('')
  const debouncedDraftSearch = useDebounce(draftSearchQuery, 500)
  const [draftStatus, setDraftStatus] = useState('all')
  const [draftSortOrder, setDraftSortOrder] = useState('desc')

  const {
    data: feedData,
    isLoading: isFeedLoading,
    isFetching: isFeedFetching,
    refetch: refetchFeed,
  } = useThreadsRecommendations({
    account_id: accountId,
    skip: (feedPage - 1) * pageSize,
    limit: pageSize,
    sort_by: sortBy,
    order: sortOrder,
    min_likes: minLikes > 0 ? minLikes : undefined,
    q: debouncedSearch || undefined,
  })

  const {
    data: draftsData,
    isLoading: isDraftsLoading,
    isFetching: isDraftsFetching,
    refetch: refetchDrafts,
  } = useThreadsPosts({
    account_id: accountId,
    skip: (draftPage - 1) * pageSize,
    limit: pageSize,
    status: draftStatus !== 'all' ? draftStatus : undefined,
    q: debouncedDraftSearch || undefined,
    order: draftSortOrder,
  })

  const { data: logsData, isLoading: isLogsLoading } = useThreadsLogs({
    account_id: accountId,
    skip: (logPage - 1) * 20,
    limit: 20,
  })

  const { mutate: collect, isPending: isCollecting } = useCollectThreadsData()
  const { mutate: generate, isPending: isGenerating } = useGenerateThreadsDrafts()
  const updateAccount = useUpdateContentAccount()

  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    if (account && !settings) {
      const d = account.data || {}
      setSettings({
        persona_role: d.persona_role || '',
        persona_context: d.persona_context || '',
        persona_gender: d.persona_gender || '',
        persona_age: d.persona_age || '',
        persona_country: d.persona_country || '',
        persona_city: d.persona_city || '',
        persona_languages: d.persona_languages || '',
        persona_tone: d.persona_tone || '',
        persona_interests: d.persona_interests || '',
        persona_whitelist: d.persona_whitelist || '',
        persona_blacklist: d.persona_blacklist || '',
        collector_limit: d.collector_limit || 20,
        collector_min_likes: d.collector_min_likes || 0,
        collector_with_media_only: d.collector_with_media_only || false,
        collector_no_media_only: d.collector_no_media_only || false,
        gen_num_posts: d.gen_num_posts || 1,
        gen_mode: d.gen_mode || 'both',
        coll_mode: d.coll_mode || 'latest_n',
        coll_window_hours: d.coll_window_hours || 24,
        coll_interval_mins: d.coll_interval_mins || 60,
        gen_interval_mins: d.gen_interval_mins || 1440,
        ai_persona_template: d.ai_persona_template || '',
        ai_generation_prompt: d.ai_generation_prompt || '',
        ai_model: d.ai_model || 'gpt-4o-mini',
      })
    }
  }, [account, settings])

  const handleSaveSettings = async () => {
    await updateAccount.mutateAsync({
      platform: 'threads',
      accountId,
      data: {
        data: {
          ...settings,
          persona_age: parseInt(settings.persona_age) || null,
          collector_limit: parseInt(settings.collector_limit) || 20,
          collector_min_likes: parseInt(settings.collector_min_likes) || 0,
          gen_num_posts: parseInt(settings.gen_num_posts) || 1,
          coll_window_hours: parseInt(settings.coll_window_hours) || 24,
          coll_interval_mins: parseInt(settings.coll_interval_mins) || 60,
          gen_interval_mins: parseInt(settings.gen_interval_mins) || 1440,
        },
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-end border-b pb-6">
        <div className="space-y-2">
          <Badge className="bg-slate-900 text-white text-[10px] uppercase">
            Threads
          </Badge>
          <div className="flex items-center space-x-3">
            <h1 className="text-4xl font-extrabold tracking-tight">
              @{account.username}
            </h1>
            <span
              className={`h-3 w-3 rounded-full ${
                account.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
          </div>
          <p className="text-muted-foreground">
            Управление AI-персоной и собранными данными
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => collect(accountId)}
            disabled={isCollecting}
            className="shadow-sm"
          >
            {isCollecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Собрать тренды
          </Button>
          <Button onClick={() => generate(accountId)} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Сгенерировать пост
          </Button>
        </div>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-xl mb-8">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Тренды
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Посты
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Настройки
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Логи
          </TabsTrigger>
        </TabsList>

        {/* TRENDS */}
        <TabsContent value="feed" className="space-y-4">
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
                    debouncedSearch !== searchQuery || isFeedFetching
                      ? 'animate-spin'
                      : ''
                  }`}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Min Likes:
                </span>
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

              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchFeed()}
                disabled={isFeedFetching}
              >
                <RefreshCcw
                  className={`h-4 w-4 mr-2 ${isFeedFetching ? 'animate-spin' : ''}`}
                />
                Обновить
              </Button>
            </div>
          </div>

          {isFeedLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-[200px] rounded-lg bg-muted animate-pulse"
                />
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
                size={pageSize}
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
        </TabsContent>

        {/* DRAFTS */}
        <TabsContent value="drafts" className="space-y-4">
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
                    debouncedDraftSearch !== draftSearchQuery || isDraftsFetching
                      ? 'animate-spin'
                      : ''
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

              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchDrafts()}
                disabled={isDraftsFetching}
              >
                <RefreshCcw
                  className={`h-4 w-4 mr-2 ${isDraftsFetching ? 'animate-spin' : ''}`}
                />
                Обновить
              </Button>
            </div>
          </div>

          {isDraftsLoading ? (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[250px] rounded-lg bg-muted animate-pulse"
                />
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
                size={pageSize}
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
        </TabsContent>

        {/* SETTINGS */}
        <TabsContent value="settings">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-600" /> AI Persona
                </CardTitle>
                <CardDescription>
                  Опишите личность, для которой AI будет генерировать посты.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Роль</Label>
                    <Input
                      value={settings?.persona_role || ''}
                      onChange={(e) =>
                        setSettings({ ...settings, persona_role: e.target.value })
                      }
                      placeholder="Например: крипто-блогер"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tone of voice</Label>
                    <Input
                      value={settings?.persona_tone || ''}
                      onChange={(e) =>
                        setSettings({ ...settings, persona_tone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Контекст</Label>
                  <Textarea
                    className="min-h-[120px]"
                    value={settings?.persona_context || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, persona_context: e.target.value })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t py-4">
                <Button
                  className="w-full"
                  onClick={handleSaveSettings}
                  disabled={updateAccount.isPending}
                >
                  {updateAccount.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Сохранить персону
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" /> Сбор данных
                </CardTitle>
                <CardDescription>
                  Настройка автоматического сбора трендов.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Лимит постов</Label>
                  <Input
                    type="number"
                    value={settings?.collector_limit || 20}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        collector_limit: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Минимум лайков</Label>
                  <Input
                    type="number"
                    value={settings?.collector_min_likes || 0}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        collector_min_likes: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Только с медиа</Label>
                  <Switch
                    checked={settings?.collector_with_media_only || false}
                    onCheckedChange={(val) =>
                      setSettings({ ...settings, collector_with_media_only: val })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Только текстовые</Label>
                  <Switch
                    checked={settings?.collector_no_media_only || false}
                    onCheckedChange={(val) =>
                      setSettings({ ...settings, collector_no_media_only: val })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t py-4">
                <Button
                  className="w-full"
                  onClick={handleSaveSettings}
                  disabled={updateAccount.isPending}
                >
                  {updateAccount.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Сохранить сбор
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* LOGS */}
        <TabsContent value="logs">
          <Card className="border-none bg-transparent">
            <CardHeader className="px-0">
              <CardTitle>Активность</CardTitle>
              <CardDescription>
                Логи фоновых задач для этого аккаунта.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[180px]">
                          Время
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">
                          Модуль
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">
                          Уровень
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                          Сообщение
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {isLogsLoading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="p-4">
                              <div className="h-4 w-32 bg-muted rounded" />
                            </td>
                            <td className="p-4">
                              <div className="h-4 w-20 bg-muted rounded" />
                            </td>
                            <td className="p-4">
                              <div className="h-4 w-16 bg-muted rounded" />
                            </td>
                            <td className="p-4">
                              <div className="h-4 w-full bg-muted rounded" />
                            </td>
                          </tr>
                        ))
                      ) : logsData?.items?.length > 0 ? (
                        logsData.items.map((log: any) => (
                          <tr
                            key={log.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-4 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase font-bold tracking-wider"
                              >
                                {log.module}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  log.level === 'ERROR'
                                    ? 'bg-red-100 text-red-700'
                                    : log.level === 'WARNING'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {log.level === 'ERROR' && (
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                )}
                                {log.level}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="font-medium text-foreground">
                                {log.message}
                              </p>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-8 text-center text-muted-foreground italic"
                          >
                            Активности пока нет.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {logsData?.total > 20 && (
                <div className="mt-4">
                  <Pagination
                    page={logPage}
                    total={logsData.total}
                    size={20}
                    onPageChange={setLogPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
