import { requester } from '../lib/requester'
import type { Platform } from './contentManager'

// Content planner: platform-neutral scheduled posts.
// Backend: apps/content_manager/{models/scheduled_post.py, routes/schedule.py}.
const BASE = '/content-manager/schedule'

// Mirrors backend models/scheduled_post.py:SCHEDULED_POST_STATUSES.
export const SCHEDULED_POST_STATUSES = [
  'scheduled',
  'publishing',
  'published',
  'failed',
  'cancelled',
] as const
export type ScheduledPostStatus = (typeof SCHEDULED_POST_STATUSES)[number]

export const SCHEDULED_POST_STATUS_LABELS: Record<ScheduledPostStatus, string> = {
  scheduled: 'Запланирован',
  publishing: 'Публикуется',
  published: 'Опубликован',
  failed: 'Ошибка',
  cancelled: 'Отменён',
}

/** Statuses the user can still edit, move, cancel (backend EDITABLE_STATUSES). */
export const SCHEDULED_POST_EDITABLE: readonly ScheduledPostStatus[] = ['scheduled', 'failed']

export interface ScheduledMedia {
  kind: 'image' | 'video'
  url: string
}

// Mirrors backend publishing/base.py content shape.
export interface ScheduledContent {
  text?: string | null
  media?: ScheduledMedia[]
  platform_options?: Record<string, Record<string, unknown>>
}

export interface ScheduledPostAccount {
  id: number
  platform: Platform
  username: string
  display_name?: string | null
}

export interface ScheduledPost {
  id: number
  account: ScheduledPostAccount
  batch_id: string
  content: ScheduledContent
  scheduled_at: string
  status: ScheduledPostStatus
  attempts: number
  next_attempt_at?: string | null
  published_at?: string | null
  external_id?: string | null
  error?: string | null
  data: Record<string, any>
  created_at: string
}

export interface ScheduledPostsResponse {
  items: ScheduledPost[]
  total: number
}

export interface ScheduledPostsQuery {
  account_id?: number
  /** Comma-separated statuses. */
  status?: string
  date_from?: string
  date_to?: string
  skip?: number
  limit?: number
}

export interface ScheduledPostCreateBody {
  account_id: number
  scheduled_at: string
  content: ScheduledContent
  timezone?: string
}

export interface ScheduledPostUpdateBody {
  scheduled_at?: string
  content?: ScheduledContent
  timezone?: string
}

export const getScheduledPosts = async (params?: ScheduledPostsQuery): Promise<ScheduledPostsResponse> => {
  const response = await requester.get(`${BASE}/`, { params })
  return response.data
}

export const createScheduledPost = async (body: ScheduledPostCreateBody): Promise<ScheduledPost> => {
  const response = await requester.post(`${BASE}/`, body)
  return response.data
}

export const updateScheduledPost = async (
  id: number,
  body: ScheduledPostUpdateBody,
): Promise<ScheduledPost> => {
  const response = await requester.patch(`${BASE}/${id}`, body)
  return response.data
}

export const cancelScheduledPost = async (id: number): Promise<ScheduledPost> => {
  const response = await requester.post(`${BASE}/${id}/cancel`)
  return response.data
}

export const publishScheduledPostNow = async (id: number): Promise<ScheduledPost> => {
  const response = await requester.post(`${BASE}/${id}/publish-now`)
  return response.data
}

export const deleteScheduledPost = async (id: number): Promise<void> => {
  await requester.delete(`${BASE}/${id}`)
}
