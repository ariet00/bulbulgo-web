import { requester } from '../lib/requester'

// Threads-specific operations on a content_manager account where platform = 'threads'.
const ACCOUNT_BASE = '/content-manager/threads/accounts'

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
