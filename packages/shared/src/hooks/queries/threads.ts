'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getThreadsAccountInsights,
  getThreadsAccountStatus,
  getThreadsGenerationPreview,
  getThreadConversation,
  getThreadMediaInsights,
  getThreadReplies,
  getThreadsLogs,
  getThreadsPosts,
  getThreadsRecommendations,
  getUserThreads,
} from '../../apis/threads'

export const useThreadsAccountStatus = (accountId: number | null) => {
  return useQuery({
    queryKey: ['threads', 'account-status', accountId],
    queryFn: () => getThreadsAccountStatus(accountId!),
    enabled: !!accountId,
    refetchInterval: (query) => {
      const status = query.state?.data?.status
      return status === 'completed' || status === 'failed' ? false : 1500
    },
  })
}

export const useThreadsPosts = (params?: {
  account_id?: number
  skip?: number
  limit?: number
  status?: string
  q?: string
  sort_by?: string
  order?: string
}) => {
  return useQuery({
    queryKey: ['threads', 'posts', params],
    queryFn: () => getThreadsPosts(params),
  })
}

export const useThreadsRecommendations = (params?: {
  account_id?: number
  skip?: number
  limit?: number
  sort_by?: string
  order?: string
  min_likes?: number
  q?: string
}) => {
  return useQuery({
    queryKey: ['threads', 'recommendations', params],
    queryFn: () => getThreadsRecommendations(params),
  })
}

export const useThreadsLogs = (params: {
  account_id: number
  skip?: number
  limit?: number
}) => {
  return useQuery({
    queryKey: ['threads', 'logs', params],
    queryFn: () => getThreadsLogs(params),
    enabled: !!params.account_id,
    refetchInterval: 5000,
  })
}

export const useUserThreads = (accountId: number | null) =>
  useQuery({
    queryKey: ['threads', 'user-threads', accountId],
    queryFn: () => getUserThreads(accountId!, 25),
    enabled: !!accountId,
  })

export const useThreadReplies = (
  accountId: number | null,
  mediaId: string | null,
) =>
  useQuery({
    queryKey: ['threads', 'replies', accountId, mediaId],
    queryFn: () => getThreadReplies(accountId!, mediaId!),
    enabled: !!accountId && !!mediaId,
    refetchInterval: 20_000,
  })

export const useThreadConversation = (
  accountId: number | null,
  mediaId: string | null,
) =>
  useQuery({
    queryKey: ['threads', 'conversation', accountId, mediaId],
    queryFn: () => getThreadConversation(accountId!, mediaId!),
    enabled: !!accountId && !!mediaId,
  })

export const useThreadsAccountInsights = (accountId: number | null) =>
  useQuery({
    queryKey: ['threads', 'insights', accountId],
    queryFn: () => getThreadsAccountInsights(accountId!),
    enabled: !!accountId,
  })

export const useThreadMediaInsights = (
  accountId: number | null,
  mediaId: string | null,
) =>
  useQuery({
    queryKey: ['threads', 'media-insights', accountId, mediaId],
    queryFn: () => getThreadMediaInsights(accountId!, mediaId!),
    enabled: !!accountId && !!mediaId,
  })

export const THREADS_GENERATION_PREVIEW_KEY = ['threads', 'generation-preview'] as const

export const useThreadsGenerationPreview = (accountId: number | null) =>
  useQuery({
    queryKey: [...THREADS_GENERATION_PREVIEW_KEY, accountId],
    queryFn: () => getThreadsGenerationPreview(accountId!),
    enabled: !!accountId,
  })

/** Call after saving persona/generation settings so the preview re-renders. */
export const useInvalidateThreadsGenerationPreview = () => {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: THREADS_GENERATION_PREVIEW_KEY })
}
