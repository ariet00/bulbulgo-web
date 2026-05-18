import { requester } from '../lib/requester'

const ACCOUNT_BASE = '/content-manager/pages/accounts'

// ───── OAuth ─────────────────────────────────────────────────────────────

export const startPagesOAuth = async (): Promise<{
  authorize_url: string
  state: string
}> => {
  const response = await requester.post('/content-manager/pages/oauth/start')
  return response.data
}

// ───── Publishing ────────────────────────────────────────────────────────

export type PageMediaType = 'TEXT' | 'PHOTO' | 'VIDEO'

export interface PagePublishBody {
  media_type: PageMediaType
  message?: string
  image_url?: string
  video_url?: string
  video_title?: string
  link?: string
}

export const publishToPage = async (
  accountId: number,
  body: PagePublishBody,
): Promise<{ status: string; result: any }> => {
  const response = await requester.post(`${ACCOUNT_BASE}/${accountId}/publish`, body)
  return response.data
}

// ───── Posts ─────────────────────────────────────────────────────────────

export interface PagePost {
  id: string
  message?: string
  created_time?: string
  permalink_url?: string
  full_picture?: string
  shares?: { count?: number }
  reactions?: { summary?: { total_count?: number } }
  comments?: { summary?: { total_count?: number } }
}

export const getPagePosts = async (
  accountId: number,
  limit = 25,
): Promise<{ data: PagePost[]; paging?: any }> => {
  const response = await requester.get(`${ACCOUNT_BASE}/${accountId}/posts`, {
    params: { limit },
  })
  return response.data
}

export const deletePagePost = async (
  accountId: number,
  postId: string,
): Promise<{ status: string }> => {
  const response = await requester.delete(
    `${ACCOUNT_BASE}/${accountId}/posts/${encodeURIComponent(postId)}`,
  )
  return response.data
}

// ───── Comments ──────────────────────────────────────────────────────────

export interface PageComment {
  id: string
  message?: string
  created_time?: string
  like_count?: number
  comment_count?: number
  is_hidden?: boolean
  from?: { id: string; name: string; picture?: { data?: { url?: string } } }
}

export const getPagePostComments = async (
  accountId: number,
  postId: string,
): Promise<{ data: PageComment[]; paging?: any }> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/posts/${encodeURIComponent(postId)}/comments`,
  )
  return response.data
}

export const replyPageComment = async (
  accountId: number,
  commentId: string,
  message: string,
): Promise<{ id: string }> => {
  const response = await requester.post(
    `${ACCOUNT_BASE}/${accountId}/comments/${encodeURIComponent(commentId)}/reply`,
    { message },
  )
  return response.data
}

export const hidePageComment = async (
  accountId: number,
  commentId: string,
  hide: boolean,
): Promise<{ status: string }> => {
  const response = await requester.post(
    `${ACCOUNT_BASE}/${accountId}/comments/${encodeURIComponent(commentId)}/hide`,
    { hide },
  )
  return response.data
}

export const deletePageComment = async (
  accountId: number,
  commentId: string,
): Promise<{ status: string }> => {
  const response = await requester.delete(
    `${ACCOUNT_BASE}/${accountId}/comments/${encodeURIComponent(commentId)}`,
  )
  return response.data
}

// ───── Insights ──────────────────────────────────────────────────────────

export const getPageInsights = async (
  accountId: number,
  period: 'day' | 'week' | 'days_28' = 'day',
): Promise<{ data: any[] }> => {
  const response = await requester.get(`${ACCOUNT_BASE}/${accountId}/insights`, {
    params: { period },
  })
  return response.data
}

export const getPagePostInsights = async (
  accountId: number,
  postId: string,
): Promise<{ data: any[] }> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/posts/${encodeURIComponent(postId)}/insights`,
  )
  return response.data
}
