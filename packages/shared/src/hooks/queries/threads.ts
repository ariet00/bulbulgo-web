'use client'

import { useQuery } from '@tanstack/react-query'

import {
  getThreadsAccountStatus,
  getThreadsLogs,
  getThreadsPosts,
  getThreadsRecommendations,
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
