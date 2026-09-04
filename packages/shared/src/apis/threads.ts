import { requester } from '../lib/requester'
import type { ScheduledPost } from './schedule'

// Threads-specific operations on a content_manager account where platform = 'threads'.
const ACCOUNT_BASE = '/content-manager/threads/accounts'

export const startThreadsOAuth = async (): Promise<{
  authorize_url: string
  state: string
}> => {
  const response = await requester.post('/content-manager/threads/oauth/start')
  return response.data
}

// ───── Direct publishing (OAuth-based) ─────────────────────────────────────

// Threads API limits (docs: developers.facebook.com/docs/threads/posts).
export const THREADS_TEXT_LIMIT = 500
export const THREADS_CAROUSEL_MIN = 2
export const THREADS_CAROUSEL_MAX = 20
export const THREADS_IMAGE_MAX_BYTES = 8 * 1024 * 1024
export const THREADS_VIDEO_MAX_BYTES = 1024 * 1024 * 1024

// `media_type` values Threads returns for a user's posts.
export const THREADS_MEDIA_TYPE_LABELS: Record<string, string> = {
  TEXT_POST: 'Текст',
  TEXT: 'Текст',
  IMAGE: 'Фото',
  VIDEO: 'Видео',
  CAROUSEL_ALBUM: 'Карусель',
  AUDIO: 'Аудио',
  REPOST_FACADE: 'Репост',
}

export type ThreadsMediaType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL'

export interface ThreadsCarouselItem {
  image_url?: string
  video_url?: string
}

export interface ThreadsPublishBody {
  media_type: ThreadsMediaType
  text?: string
  image_url?: string
  video_url?: string
  reply_to_id?: string
  carousel_items?: ThreadsCarouselItem[]
  /** From `searchThreadsLocations`; needs the location-tagging scope. */
  location_id?: string
}

export const publishToThreads = async (
  accountId: number,
  body: ThreadsPublishBody,
): Promise<{ status: string; media_id: string }> => {
  const response = await requester.post(`${ACCOUNT_BASE}/${accountId}/publish`, body)
  return response.data
}

export interface ThreadsMedia {
  id: string
  media_product_type?: string
  media_type?: string
  media_url?: string
  permalink?: string
  text?: string
  timestamp?: string
  username?: string
  thumbnail_url?: string
  is_quote_post?: boolean
  has_replies?: boolean
  is_reply?: boolean
  topic_tag?: string
  link_attachment_url?: string
  location_id?: string
  location?: Pick<ThreadsLocation, 'id' | 'name' | 'city' | 'country'>
}

export const getUserThreads = async (
  accountId: number,
  limit = 25,
): Promise<{ data: ThreadsMedia[]; paging?: any }> => {
  const response = await requester.get(`${ACCOUNT_BASE}/${accountId}/threads`, {
    params: { limit },
  })
  return response.data
}

export const deleteThread = async (
  accountId: number,
  threadId: string,
): Promise<{ status: string }> => {
  const response = await requester.delete(
    `${ACCOUNT_BASE}/${accountId}/threads/${encodeURIComponent(threadId)}`,
  )
  return response.data
}

// ───── Replies management ──────────────────────────────────────────────────

export interface ThreadsReply {
  id: string
  text?: string
  username?: string
  timestamp?: string
  hide_status?: string
  is_reply?: boolean
  permalink?: string
  replied_to?: { id: string }
  root_post?: { id: string }
}

export const getThreadReplies = async (
  accountId: number,
  mediaId: string,
): Promise<{ data: ThreadsReply[]; paging?: any }> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/threads/${encodeURIComponent(mediaId)}/replies`,
  )
  return response.data
}

export const getThreadConversation = async (
  accountId: number,
  mediaId: string,
): Promise<{ data: ThreadsReply[]; paging?: any }> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/threads/${encodeURIComponent(mediaId)}/conversation`,
  )
  return response.data
}

export const hideThreadsReply = async (
  accountId: number,
  replyId: string,
  hide: boolean,
): Promise<{ status: string }> => {
  const response = await requester.post(
    `${ACCOUNT_BASE}/${accountId}/replies/${encodeURIComponent(replyId)}/hide`,
    { hide },
  )
  return response.data
}

export const replyToThread = async (
  accountId: number,
  mediaId: string,
  text: string,
): Promise<{ status: string; media_id: string }> => {
  const response = await requester.post(
    `${ACCOUNT_BASE}/${accountId}/threads/${encodeURIComponent(mediaId)}/reply`,
    { text },
  )
  return response.data
}

// ───── Insights ────────────────────────────────────────────────────────────

export const getThreadsAccountInsights = async (
  accountId: number,
): Promise<{ data: any[] }> => {
  const response = await requester.get(`${ACCOUNT_BASE}/${accountId}/insights`)
  return response.data
}

export const getThreadMediaInsights = async (
  accountId: number,
  mediaId: string,
): Promise<{ data: any[] }> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/threads/${encodeURIComponent(mediaId)}/insights`,
  )
  return response.data
}

// ───── Keyword search + locations (discovery) ─────────────────────────────

// Mirrors backend apps/content_manager/meta/threads_search.py SEARCH_*.
export const THREADS_SEARCH_TYPES = ['TOP', 'RECENT'] as const
export type ThreadsSearchType = (typeof THREADS_SEARCH_TYPES)[number]
export const THREADS_SEARCH_TYPE_LABELS: Record<ThreadsSearchType, string> = {
  TOP: 'Популярные',
  RECENT: 'Свежие',
}
export const THREADS_SEARCH_MODES = ['KEYWORD', 'TAG'] as const
export type ThreadsSearchMode = (typeof THREADS_SEARCH_MODES)[number]
export const THREADS_SEARCH_MODE_LABELS: Record<ThreadsSearchMode, string> = {
  KEYWORD: 'По словам',
  TAG: 'По тегу',
}
export const THREADS_SEARCH_MEDIA_TYPES = ['TEXT', 'IMAGE', 'VIDEO'] as const
export type ThreadsSearchMediaType = (typeof THREADS_SEARCH_MEDIA_TYPES)[number]
export const THREADS_SEARCH_MEDIA_TYPE_LABELS: Record<ThreadsSearchMediaType, string> = {
  TEXT: 'Текст',
  IMAGE: 'Фото',
  VIDEO: 'Видео',
}
export const THREADS_SEARCH_MAX_LIMIT = 100
/** Meta's rolling 24h cap per Threads user, shared across every app. */
export const THREADS_SEARCH_DAILY_QUERY_LIMIT = 2200

// Mirrors backend apps/content_manager/meta/threads_oauth.py SCOPE_*.
export const THREADS_SCOPE_KEYWORD_SEARCH = 'threads_keyword_search'
export const THREADS_SCOPE_LOCATION_TAGGING = 'threads_location_tagging'

/** Scopes the stored token was issued with (backend stores them at OAuth time). */
export const threadsAccountScopes = (account: { credentials?: Record<string, unknown> }): string[] => {
  const scopes = account.credentials?.scopes
  return Array.isArray(scopes) ? (scopes as string[]) : []
}

export const threadsAccountHasScope = (
  account: { credentials?: Record<string, unknown> },
  scope: string,
): boolean => threadsAccountScopes(account).includes(scope)

export interface ThreadsSearchParams {
  q: string
  search_type?: ThreadsSearchType
  search_mode?: ThreadsSearchMode
  media_type?: ThreadsSearchMediaType
  /** Unix seconds. */
  since?: number
  until?: number
  limit?: number
  author_username?: string
  after?: string
}

export const searchThreads = async (
  accountId: number,
  params: ThreadsSearchParams,
): Promise<{ data: ThreadsMedia[]; paging?: any }> => {
  const response = await requester.get(`${ACCOUNT_BASE}/${accountId}/search`, { params })
  return response.data
}

export interface ThreadsRecentKeyword {
  query: string
  /** Unix milliseconds. */
  timestamp: number
}

export const getThreadsRecentKeywords = async (
  accountId: number,
): Promise<{ data: ThreadsRecentKeyword[] }> => {
  const response = await requester.get(`${ACCOUNT_BASE}/${accountId}/search/recent-keywords`)
  return response.data
}

export interface ThreadsLocation {
  id: string
  name: string
  address?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  postal_code?: string
}

export const searchThreadsLocations = async (
  accountId: number,
  params: { q?: string; latitude?: number; longitude?: number },
): Promise<{ data: ThreadsLocation[] }> => {
  const response = await requester.get(`${ACCOUNT_BASE}/${accountId}/locations/search`, { params })
  // Meta returns numeric ids in search results but expects a string `location_id` on publish.
  const data = ((response.data?.data || []) as ThreadsLocation[]).map((l) => ({ ...l, id: String(l.id) }))
  return { data }
}

// ───── Trend collector settings (Account.data keys) ───────────────────────
// Mirrors backend apps/threeds/tasks/collector.py COLLECTOR_*.

export const THREADS_COLLECTOR_SEARCH_TYPES = ['TOP', 'RECENT', 'BOTH'] as const
export type ThreadsCollectorSearchType = (typeof THREADS_COLLECTOR_SEARCH_TYPES)[number]
export const THREADS_COLLECTOR_SEARCH_TYPE_LABELS: Record<ThreadsCollectorSearchType, string> = {
  TOP: 'Популярные',
  RECENT: 'Свежие',
  BOTH: 'Популярные и свежие',
}
export const THREADS_COLLECTOR_MEDIA_TYPES = ['ANY', ...THREADS_SEARCH_MEDIA_TYPES] as const
export type ThreadsCollectorMediaType = (typeof THREADS_COLLECTOR_MEDIA_TYPES)[number]
export const THREADS_COLLECTOR_MEDIA_TYPE_LABELS: Record<ThreadsCollectorMediaType, string> = {
  ANY: 'Любые',
  ...THREADS_SEARCH_MEDIA_TYPE_LABELS,
}
export const THREADS_COLLECTOR_MAX_KEYWORDS = 30
export const THREADS_COLLECTOR_DEFAULT_LIMIT = 20
export const THREADS_COLLECTOR_DEFAULT_WINDOW_HOURS = 24

/** Keywords the collector searches for; `#tag` entries run as topic-tag searches. */
export const threadsCollectorKeywords = (account: { data?: Record<string, any> }): string[] => {
  const raw = account.data?.collector_keywords
  return Array.isArray(raw) ? raw.filter((k): k is string => typeof k === 'string' && k.trim().length > 0) : []
}

// ───── Collected trends (threeds.feed_items) ──────────────────────────────

// Mirrors backend routes/threads/recommendations.py TREND_SORTS.
export const THREADS_TREND_SORTS = ['score', 'created_at'] as const
export type ThreadsTrendSort = (typeof THREADS_TREND_SORTS)[number]
export const THREADS_TREND_SORT_LABELS: Record<ThreadsTrendSort, string> = {
  score: 'По рангу',
  created_at: 'По дате сбора',
}

/** What the collector stores in `raw_data` (apps/threeds/tasks/collector.py). */
export interface ThreadsFeedItemRaw {
  query?: string
  search_mode?: ThreadsSearchMode
  search_type?: ThreadsSearchType
  rank?: number
  permalink?: string
  media_type?: string
  timestamp?: string
  media_url?: string
  thumbnail_url?: string
  topic_tag?: string
  has_replies?: boolean
  collected_at?: string
}

export interface ThreadsFeedItem {
  id: number
  account_id: number
  external_id: string
  author_username: string
  text?: string | null
  combined_score?: number
  raw_data?: ThreadsFeedItemRaw | null
  created_at?: string
}

export interface ThreadsTrendsQuery {
  account_id?: number
  skip?: number
  limit?: number
  sort_by?: ThreadsTrendSort
  order?: 'asc' | 'desc'
  /** Text search in post body / author. */
  q?: string
  /** Only items found by this keyword (without `#`). */
  query?: string
}

// ───── AI draft generator (lab pipeline) ───────────────────────────────────

// Mirrors backend apps/threeds/service/prompt_builder.py:GEN_MODES.
export const THREADS_GEN_MODES = ['both', 'recs_only', 'persona_only'] as const
export type ThreadsGenMode = (typeof THREADS_GEN_MODES)[number]
export const THREADS_GEN_MODE_LABELS: Record<ThreadsGenMode, string> = {
  both: 'Персона и тренды',
  recs_only: 'Только по трендам',
  persona_only: 'Только персона',
}

// Models the generator may be pointed at (OpenAI structured outputs).
export const THREADS_AI_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'] as const

export interface ThreadsGenerationPreview {
  can_generate: boolean
  blockers: string[]
  system_prompt: string | null
  user_prompt: string | null
  model: string
  mode: string
  modes: string[]
  num_posts: number
  trends_count: number
}

export const getThreadsGenerationPreview = async (
  accountId: number,
): Promise<ThreadsGenerationPreview> => {
  const response = await requester.get(`${ACCOUNT_BASE}/${accountId}/generation-preview`)
  return response.data
}

export const collectThreadsAccountData = async (accountId: number) => {
  const response = await requester.post(`${ACCOUNT_BASE}/${accountId}/collect`)
  return response.data
}

export const generateThreadsDrafts = async (accountId: number) => {
  const response = await requester.post(`${ACCOUNT_BASE}/${accountId}/generate`)
  return response.data
}

export const getThreadsPosts = async (params?: {
  account_id?: number
  skip?: number
  limit?: number
  status?: string
  q?: string
  sort_by?: string
  order?: string
}) => {
  const response = await requester.get('/content-manager/threads/posts/', { params })
  return response.data
}

export const getThreadsRecommendations = async (
  params?: ThreadsTrendsQuery,
): Promise<{ items: ThreadsFeedItem[]; total: number; skip: number; limit: number }> => {
  const response = await requester.get('/content-manager/threads/recommendations/', { params })
  return response.data
}

export const getThreadsLogs = async (params: {
  account_id: number
  skip?: number
  limit?: number
}) => {
  const response = await requester.get('/content-manager/threads/logs/', { params })
  return response.data
}

export const updateThreadsPost = async (postId: number, data: any) => {
  const response = await requester.patch(`/content-manager/threads/posts/${postId}`, data)
  return response.data
}

export const publishThreadsPost = async (postId: number) => {
  const response = await requester.post(`/content-manager/threads/posts/${postId}/publish`)
  return response.data
}

/** Put an AI draft into the content planner (draft becomes `approved`). */
export const scheduleThreadsDraft = async (
  postId: number,
  body: { scheduled_at: string; timezone?: string },
): Promise<ScheduledPost> => {
  const response = await requester.post(`/content-manager/threads/posts/${postId}/schedule`, body)
  return response.data
}

export const deleteThreadsPost = async (postId: number) => {
  const response = await requester.delete(`/content-manager/threads/posts/${postId}`)
  return response.data
}

export const deleteThreadsRecommendation = async (itemId: number) => {
  const response = await requester.delete(`/content-manager/threads/recommendations/${itemId}`)
  return response.data
}
