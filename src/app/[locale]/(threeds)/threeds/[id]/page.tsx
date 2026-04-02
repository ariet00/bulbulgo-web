'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  useThreedsAccount,
  useThreedsRecommendations,
  useThreedsPosts
} from '@/hooks/queries/threeds'
import {
  useCollectAccountData,
  useGenerateDrafts,
  useUpdateAccount
} from '@/hooks/mutations/threeds'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Pagination } from '@/components/ui/pagination-custom'
import { FeedItemCard } from '@/components/threeds/FeedItemCard'
import { PostCard } from '@/components/threeds/PostCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Loader2,
  RefreshCcw,
  Wand2,
  ArrowLeft,
  Settings,
  FileText,
  TrendingUp,
  Save
} from 'lucide-react'
import { Link } from '@/i18n/routing'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'

export default function AccountDetailPage() {
  const params = useParams()
  const accountId = parseInt(params.id as string)

  // State for pagination
  const [feedPage, setFeedPage] = useState(1)
  const [draftPage, setDraftPage] = useState(1)
  const pageSize = 12

  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [minLikes, setMinLikes] = useState<number>(0)

  // State for Drafts filtering
  const [draftSearchQuery, setDraftSearchQuery] = useState('')
  const debouncedDraftSearch = useDebounce(draftSearchQuery, 500)
  const [draftStatus, setDraftStatus] = useState('all')
  const [draftSortOrder, setDraftSortOrder] = useState('desc')

  // Queries
  const { data: account, isLoading: isAccLoading } = useThreedsAccount(accountId)
  const {
    data: feedData,
    isLoading: isFeedLoading,
    isFetching: isFeedFetching,
    refetch: refetchFeed
  } = useThreedsRecommendations({
    account_id: accountId,
    skip: (feedPage - 1) * pageSize,
    limit: pageSize,
    sort_by: sortBy,
    order: sortOrder,
    min_likes: minLikes > 0 ? minLikes : undefined,
    q: debouncedSearch || undefined
  })
  const {
    data: draftsData,
    isLoading: isDraftsLoading,
    isFetching: isDraftsFetching,
    refetch: refetchDrafts
  } = useThreedsPosts({
    account_id: accountId,
    skip: (draftPage - 1) * pageSize,
    limit: pageSize,
    status: draftStatus !== 'all' ? draftStatus : undefined,
    q: debouncedDraftSearch || undefined,
    order: draftSortOrder
  })

  // Mutations
  const { mutate: collect, isPending: isCollecting } = useCollectAccountData()
  const { mutate: generate, isPending: isGenerating } = useGenerateDrafts()
  const updateAccount = useUpdateAccount()

  // Local state for settings form
  const [settings, setSettings] = useState<any>(null)

  // Sync settings once account is loaded
  React.useEffect(() => {
    if (account && !settings) {
      setSettings({
        persona_role: account.persona_role || '',
        persona_context: account.persona_context || '',
        persona_gender: account.persona_gender || '',
        persona_age: account.persona_age || '',
        collector_limit: account.collector_limit || 20,
        collector_min_likes: account.collector_min_likes || 0,
        collector_with_media_only: account.collector_with_media_only || false,
        collector_no_media_only: account.collector_no_media_only || false,

        // Advanced settings defaults
        gen_num_posts: account.gen_num_posts || 1,
        gen_mode: account.gen_mode || 'both',
        coll_mode: account.coll_mode || 'latest_n',
        coll_window_hours: account.coll_window_hours || 24,
        coll_interval_mins: account.coll_interval_mins || 60,
        gen_interval_mins: account.gen_interval_mins || 1440,
        persona_country: account.persona_country || '',
        persona_city: account.persona_city || '',
        persona_languages: account.persona_languages || '',
        persona_tone: account.persona_tone || '',
        persona_interests: account.persona_interests || '',
        persona_whitelist: account.persona_whitelist || '',
        persona_blacklist: account.persona_blacklist || '',
      })
    }
  }, [account, settings])

  if (isAccLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleSaveSettings = async () => {
    try {
      await updateAccount.mutateAsync({
        accountId,
        data: {
          ...settings,
          persona_age: parseInt(settings.persona_age) || null,
          collector_limit: parseInt(settings.collector_limit) || 20,
          collector_min_likes: parseInt(settings.collector_min_likes) || 0,
          gen_num_posts: parseInt(settings.gen_num_posts) || 1,
          coll_window_hours: parseInt(settings.coll_window_hours) || 24,
          coll_interval_mins: parseInt(settings.coll_interval_mins) || 60,
          gen_interval_mins: parseInt(settings.gen_interval_mins) || 1440,
        }
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-end border-b pb-6">
        <div className="space-y-2">
          <Link href="/threeds" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-4xl font-extrabold tracking-tight">@{account?.username}</h1>
            <span className={`h-3 w-3 rounded-full ${account?.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          </div>
          <p className="text-muted-foreground">Manage AI Persona and view gathered intelligence</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => collect(accountId)}
            disabled={isCollecting}
            className="shadow-sm"
          >
            {isCollecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Collect Trends
          </Button>
          <Button
            onClick={() => generate(accountId)}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate Post
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Trends
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Posts
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* FEED TAB */}
        <TabsContent value="feed" className="space-y-4 outline-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Input
                  placeholder="Search in trends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
                <Loader2 className={`absolute left-3 top-2.5 h-4 w-4 text-muted-foreground ${debouncedSearch !== searchQuery || isFeedFetching ? 'animate-spin' : ''}`} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Min Likes:</span>
                <Input
                  type="number"
                  value={minLikes}
                  onChange={(e) => setMinLikes(parseInt(e.target.value) || 0)}
                  className="w-20 h-9 px-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="likes">🔥 Engagment</SelectItem>
                    <SelectItem value="reposts">🔄 Reposts</SelectItem>
                    <SelectItem value="replies">💬 Replies</SelectItem>
                    <SelectItem value="created_at">📅 Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="h-9 w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc</SelectItem>
                  <SelectItem value="asc">Asc</SelectItem>
                </SelectContent>
              </Select>

              <div className="h-6 w-px bg-border mx-1 hidden md:block" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchFeed()}
                disabled={isFeedFetching}
                className="h-9 text-muted-foreground hover:text-primary"
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${isFeedFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {isFeedLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => <div key={i} className="h-[200px] rounded-lg bg-muted animate-pulse" />)}
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
                  <p className="text-lg font-semibold">No trends collected yet</p>
                  <p className="text-muted-foreground">Click "Refresh Trends" to start gathering data from Threads.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* DRAFTS TAB */}
        <TabsContent value="drafts" className="space-y-4 outline-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Input
                  placeholder="Search in drafts..."
                  value={draftSearchQuery}
                  onChange={(e) => setDraftSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
                <Loader2 className={`absolute left-3 top-2.5 h-4 w-4 text-muted-foreground ${debouncedDraftSearch !== draftSearchQuery || isDraftsFetching ? 'animate-spin' : ''}`} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Status:</span>
                <Select value={draftStatus} onValueChange={setDraftStatus}>
                  <SelectTrigger className="h-9 w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">📝 Draft</SelectItem>
                    <SelectItem value="approved">✅ Approved</SelectItem>
                    <SelectItem value="scheduled">⏰ Scheduled</SelectItem>
                    <SelectItem value="published">🚀 Published</SelectItem>
                    <SelectItem value="error">❌ Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Order:</span>
                <Select value={draftSortOrder} onValueChange={setDraftSortOrder}>
                  <SelectTrigger className="h-9 w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest</SelectItem>
                    <SelectItem value="asc">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="h-6 w-px bg-border mx-1 hidden md:block" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchDrafts()}
                disabled={isDraftsFetching}
                className="h-9 text-muted-foreground hover:text-primary"
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${isDraftsFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {isDraftsLoading ? (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-[250px] rounded-lg bg-muted animate-pulse" />)}
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
                  <p className="text-lg font-semibold">No drafts generated yet</p>
                  <p className="text-muted-foreground">Click "Generate Magic" to let AI create content candidates.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="outline-none">
          <div className="grid gap-6 md:grid-cols-2">
            {/* AI Persona */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-600" /> AI Persona Profile
                </CardTitle>
                <CardDescription>
                  Define the personality and writing style for your AI assistant.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role / Occupation</Label>
                    <Input
                      id="role"
                      value={settings?.persona_role || ''}
                      onChange={e => setSettings({ ...settings, persona_role: e.target.value })}
                      placeholder="e.g. Crypto Blogger"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={settings?.persona_gender || ''}
                      onChange={e => setSettings({ ...settings, persona_gender: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Approximate Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={settings?.persona_age || ''}
                      onChange={e => setSettings({ ...settings, persona_age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone of Voice</Label>
                    <Input
                      id="tone"
                      value={settings?.persona_tone || ''}
                      onChange={e => setSettings({ ...settings, persona_tone: e.target.value })}
                      placeholder="e.g. Sarcastic, Professional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={settings?.persona_country || ''}
                      onChange={e => setSettings({ ...settings, persona_country: e.target.value })}
                      placeholder="e.g. United Kingdom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={settings?.persona_city || ''}
                      onChange={e => setSettings({ ...settings, persona_city: e.target.value })}
                      placeholder="e.g. London"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languages">Languages</Label>
                  <Input
                    id="languages"
                    value={settings?.persona_languages || ''}
                    onChange={e => setSettings({ ...settings, persona_languages: e.target.value })}
                    placeholder="e.g. English, Russian"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Interests & Hobbies</Label>
                  <Input
                    id="interests"
                    value={settings?.persona_interests || ''}
                    onChange={e => setSettings({ ...settings, persona_interests: e.target.value })}
                    placeholder="e.g. Crypto, Coffee, Sci-Fi"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whitelist">Whitelist Topics (Prefer)</Label>
                    <Textarea
                      id="whitelist"
                      value={settings?.persona_whitelist || ''}
                      onChange={e => setSettings({ ...settings, persona_whitelist: e.target.value })}
                      placeholder="e.g. AI News, Startups"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blacklist">Blacklist Topics (Avoid)</Label>
                    <Textarea
                      id="blacklist"
                      value={settings?.persona_blacklist || ''}
                      onChange={e => setSettings({ ...settings, persona_blacklist: e.target.value })}
                      placeholder="e.g. Politics, Religion"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="context">Style & Context</Label>
                  <Textarea
                    id="context"
                    className="min-h-[150px]"
                    value={settings?.persona_context || ''}
                    onChange={e => setSettings({ ...settings, persona_context: e.target.value })}
                    placeholder="Describe writing style, tone, common phrases and background..."
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t py-4">
                <Button
                  className="w-full"
                  onClick={handleSaveSettings}
                  disabled={updateAccount.isPending}
                >
                  {updateAccount.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Persona
                </Button>
              </CardFooter>
            </Card>

            {/* AI Strategy */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-indigo-600" /> AI Strategy
                </CardTitle>
                <CardDescription>
                  Configure how AI generates post candidates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Inspiration Source</Label>
                  <Select
                    value={settings?.gen_mode || 'both'}
                    onValueChange={val => setSettings({ ...settings, gen_mode: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="topic_only">Persona Role (Topic) Only</SelectItem>
                      <SelectItem value="recs_only">Recent Trends Only</SelectItem>
                      <SelectItem value="both">Hybrid (Topic + Trends)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numPosts">Drafts per generation</Label>
                  <Input
                    id="numPosts"
                    type="number"
                    min={1}
                    max={5}
                    value={settings?.gen_num_posts || 1}
                    onChange={e => setSettings({ ...settings, gen_num_posts: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Number of drafts to create in each AI run.</p>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t py-4">
                <Button
                  className="w-full"
                  onClick={handleSaveSettings}
                  disabled={updateAccount.isPending}
                >
                  {updateAccount.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Strategy
                </Button>
              </CardFooter>
            </Card>

            {/* Automation Schedule */}
            <Card className="shadow-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCcw className="h-5 w-5 text-green-600" /> Automation Schedule
                </CardTitle>
                <CardDescription>
                  Automatically run tasks in the background using Celery Beat.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Feed Collection Frequency</Label>
                  <Select
                    value={String(settings?.coll_interval_mins || 60)}
                    onValueChange={val => setSettings({ ...settings, coll_interval_mins: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                      <SelectItem value="360">Every 6 hours</SelectItem>
                      <SelectItem value="1440">Once a day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>AI Generation Frequency</Label>
                  <Select
                    value={String(settings?.gen_interval_mins || 1440)}
                    onValueChange={val => setSettings({ ...settings, gen_interval_mins: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">Every hour</SelectItem>
                      <SelectItem value="360">Every 6 hours</SelectItem>
                      <SelectItem value="720">Every 12 hours</SelectItem>
                      <SelectItem value="1440">Once a day</SelectItem>
                      <SelectItem value="2880">Every 2 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t py-4">
                <Button
                  className="w-full"
                  onClick={handleSaveSettings}
                  disabled={updateAccount.isPending}
                >
                  {updateAccount.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Schedule
                </Button>
              </CardFooter>
            </Card>

            {/* Collector Settings */}
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" /> Crawler Configuration
                  </CardTitle>
                  <CardDescription>
                    Fine-tune how data is collected from the Threads recommendation feed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Collection Mode</Label>
                      <Select
                        value={settings?.coll_mode || 'latest_n'}
                        onValueChange={val => setSettings({ ...settings, coll_mode: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="latest_n">Latest N Posts</SelectItem>
                          <SelectItem value="window">Time Accumulation Window</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {settings?.coll_mode === 'latest_n' ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="limit">Collection Limit</Label>
                          <span className="text-xs font-mono">{settings?.collector_limit || 20} posts</span>
                        </div>
                        <Input
                          id="limit"
                          type="number"
                          value={settings?.collector_limit || 20}
                          onChange={e => setSettings({ ...settings, collector_limit: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Time Window</Label>
                        <Select
                          value={String(settings?.coll_window_hours || 24)}
                          onValueChange={val => setSettings({ ...settings, coll_window_hours: val })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Last 1 hour</SelectItem>
                            <SelectItem value="6">Last 6 hours</SelectItem>
                            <SelectItem value="24">Last 24 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="minLikes">Min Likes Threshold</Label>
                      <span className="text-xs font-mono">{settings?.collector_min_likes || 0} likes</span>
                    </div>
                    <Input
                      id="minLikes"
                      type="number"
                      value={settings?.collector_min_likes || 0}
                      onChange={e => setSettings({ ...settings, collector_min_likes: e.target.value })}
                    />
                  </div>
                  <div className="pt-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mediaOnly" className="cursor-pointer">Only posts with media</Label>
                      <Switch
                        id="mediaOnly"
                        checked={settings?.collector_with_media_only || false}
                        onCheckedChange={val => setSettings({ ...settings, collector_with_media_only: val })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="noMedia" className="cursor-pointer">Only text posts (no media)</Label>
                      <Switch
                        id="noMedia"
                        checked={settings?.collector_no_media_only || false}
                        onCheckedChange={val => setSettings({ ...settings, collector_no_media_only: val })}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t py-4">
                  <Button
                    className="w-full"
                    onClick={handleSaveSettings}
                    disabled={updateAccount.isPending}
                  >
                    {updateAccount.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Collector
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
