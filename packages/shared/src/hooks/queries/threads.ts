'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getThreadsAccountInsights,
  getThreadsGenerationPreview,
  getThreadConversation,
  getThreadMediaInsights,
  getThreadReplies,
  getThreadsLogs,
  getThreadsPosts,
  getThreadsRecentKeywords,
  getThreadsRecommendations,
  getUserThreads,
  searchThreads,
  searchThreadsLocations,
  type ThreadsSearchParams,
  type ThreadsTrendsQuery,
} from '../../apis/threads'

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

export const useThreadsRecommendations = (params?: ThreadsTrendsQuery) => {
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

/** Runs only for a submitted query: every call burns one of the user's daily searches. */
export const useThreadsSearch = (accountId: number | null, params: ThreadsSearchParams | null) =>
  useQuery({
    queryKey: ['threads', 'search', accountId, params],
    queryFn: () => searchThreads(accountId!, params!),
    enabled: !!accountId && !!params?.q,
    staleTime: 5 * 60_000,
    retry: false,
  })

export const useThreadsRecentKeywords = (accountId: number | null) =>
  useQuery({
    queryKey: ['threads', 'recent-keywords', accountId],
    queryFn: () => getThreadsRecentKeywords(accountId!),
    enabled: !!accountId,
    staleTime: 60_000,
  })

export const useThreadsLocationSearch = (accountId: number | null, q: string) =>
  useQuery({
    queryKey: ['threads', 'locations', accountId, q.trim()],
    queryFn: () => searchThreadsLocations(accountId!, { q: q.trim() }),
    enabled: !!accountId && q.trim().length >= 2,
    staleTime: 10 * 60_000,
    retry: false,
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
