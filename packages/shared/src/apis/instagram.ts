import { requester } from '../lib/requester'

const ACCOUNT_BASE = '/content-manager/instagram/accounts'

export const startInstagramOAuth = async (): Promise<{
  authorize_url: string
  state: string
}> => {
  const response = await requester.post('/content-manager/instagram/oauth/start')
  return response.data
}

// ───── Publishing ─────────────────────────────────────────────────────────

export type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'REELS' | 'CAROUSEL'

export interface InstagramCarouselItem {
  image_url?: string
  video_url?: string
}

export interface InstagramPublishBody {
  media_type: InstagramMediaType
  caption?: string
  image_url?: string
  video_url?: string
  cover_url?: string
  carousel_items?: InstagramCarouselItem[]
}

export const publishToInstagram = async (
  accountId: number,
  body: InstagramPublishBody,
): Promise<{ status: string; media_id: string }> => {
  const response = await requester.post(`${ACCOUNT_BASE}/${accountId}/publish`, body)
  return response.data
}

// ───── Media + Comments ───────────────────────────────────────────────────

export interface InstagramMedia {
  id: string
  caption?: string
  media_type: string
  media_url?: string
  permalink?: string
  thumbnail_url?: string
  timestamp?: string
  like_count?: number
  comments_count?: number
}

export const getInstagramMedia = async (
  accountId: number,
  limit = 25,
): Promise<{ data: InstagramMedia[]; paging?: any }> => {
  const response = await requester.get(`${ACCOUNT_BASE}/${accountId}/media`, {
    params: { limit },
  })
  return response.data
}

export interface InstagramComment {
  id: string
  text?: string
  username?: string
  timestamp?: string
  like_count?: number
  hidden?: boolean
  replies?: { data: InstagramComment[] }
}

export const getInstagramMediaComments = async (
  accountId: number,
  mediaId: string,
): Promise<{ data: InstagramComment[]; paging?: any }> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/media/${mediaId}/comments`,
  )
  return response.data
}

export const replyInstagramComment = async (
  accountId: number,
  commentId: string,
  message: string,
): Promise<{ id: string }> => {
  const response = await requester.post(
    `${ACCOUNT_BASE}/${accountId}/comments/${commentId}/reply`,
    { message },
  )
  return response.data
}

export const hideInstagramComment = async (
  accountId: number,
  commentId: string,
  hide: boolean,
): Promise<{ status: string }> => {
  const response = await requester.post(
    `${ACCOUNT_BASE}/${accountId}/comments/${commentId}/hide`,
    { hide },
  )
  return response.data
}

export const deleteInstagramComment = async (
  accountId: number,
  commentId: string,
): Promise<{ status: string }> => {
  const response = await requester.delete(
    `${ACCOUNT_BASE}/${accountId}/comments/${commentId}`,
  )
  return response.data
}

// ───── Direct Messages ────────────────────────────────────────────────────

export interface InstagramConversationSummary {
  id: number
  participant_ig_id: string
  participant_username?: string | null
  last_message_at?: string | null
  last_message_preview?: string | null
  unread_count: number
}

export const getInstagramConversations = async (
  accountId: number,
): Promise<InstagramConversationSummary[]> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/conversations`,
  )
  return response.data
}

export interface InstagramDirectMessage {
  id: number
  ig_message_id: string
  direction: 'inbound' | 'outbound'
  sender_ig_id?: string | null
  body?: string | null
  attachments: any[]
  sent_at: string
  read: boolean
}

export const getInstagramConversationMessages = async (
  accountId: number,
  conversationId: number,
): Promise<InstagramDirectMessage[]> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/conversations/${conversationId}/messages`,
  )
  return response.data
}

export const sendInstagramMessage = async (
  accountId: number,
  conversationId: number,
  body: { text?: string; attachment_url?: string; attachment_type?: string },
): Promise<{ status: string }> => {
  const response = await requester.post(
    `${ACCOUNT_BASE}/${accountId}/conversations/${conversationId}/messages`,
    body,
  )
  return response.data
}

// ───── Insights ───────────────────────────────────────────────────────────

export const getInstagramAccountInsights = async (
  accountId: number,
  period: 'day' | 'week' | 'days_28' = 'day',
): Promise<{ data: any[] }> => {
  const response = await requester.get(`${ACCOUNT_BASE}/${accountId}/insights`, {
    params: { period },
  })
  return response.data
}

export const getInstagramMediaInsights = async (
  accountId: number,
  mediaId: string,
): Promise<{ data: any[] }> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/media/${mediaId}/insights`,
  )
  return response.data
}
