import { requester } from '../lib/requester'

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

// ───── AI draft generator (scraper/lab pipeline) ───────────────────────────

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

export const getThreadsAccountStatus = async (accountId: number) => {
  const response = await requester.get(`${ACCOUNT_BASE}/${accountId}/status`)
  return response.data
}

export const submitThreadsAccount2FA = async (accountId: number, code: string) => {
  const response = await requester.post(`${ACCOUNT_BASE}/${accountId}/submit-2fa`, { code })
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

export const getThreadsRecommendations = async (params?: {
  account_id?: number
  skip?: number
  limit?: number
  sort_by?: string
  order?: string
  min_likes?: number
  q?: string
}) => {
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

export const deleteThreadsPost = async (postId: number) => {
  const response = await requester.delete(`/content-manager/threads/posts/${postId}`)
  return response.data
}

export const deleteThreadsRecommendation = async (itemId: number) => {
  const response = await requester.delete(`/content-manager/threads/recommendations/${itemId}`)
  return response.data
}
