'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../../apis/threeds'

export const useThreedsAccounts = () => {
  return useQuery({
    queryKey: ['threeds', 'accounts'],
    queryFn: api.getAccounts,
  })
}

export const useThreedsAccount = (accountId: number) => {
  return useQuery({
    queryKey: ['threeds', 'account', accountId],
    queryFn: () => api.getAccount(accountId),
    enabled: !!accountId
  })
}

export const useCreateThreedsAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threeds', 'accounts'] })
    }
  })
}

export const useThreedsAccountStatus = (accountId: number | null) => {
  return useQuery({
    queryKey: ['threeds', 'account-status', accountId],
    queryFn: () => api.getAccountStatus(accountId!),
    enabled: !!accountId,
    refetchInterval: (query) => {
      const status = query.state?.data?.status;
      // Stop polling if completed or failed, else poll every 1.5 seconds
      return (status === 'completed' || status === 'failed') ? false : 1500;
    }
  })
}

export const useSubmitThreeds2FA = () => {
  return useMutation({
    mutationFn: ({ accountId, code }: { accountId: number, code: string }) => api.submitAccount2FA(accountId, code)
  })
}

export const useThreedsPosts = (params?: {
  account_id?: number,
  skip?: number,
  limit?: number,
  status?: string,
  q?: string,
  sort_by?: string,
  order?: string
}) => {
  return useQuery({
    queryKey: ['threeds', 'posts', params],
    queryFn: () => api.getGeneratedPosts(params),
  })
}

export const useThreedsRecommendations = (params?: {
  account_id?: number,
  skip?: number,
  limit?: number,
  sort_by?: string,
  order?: string,
  min_likes?: number,
  q?: string
}) => {
  return useQuery({
    queryKey: ['threeds', 'recommendations', params],
    queryFn: () => api.getRecommendations(params),
  })
}

export const useThreedsLogs = (params: {
  account_id: number,
  skip?: number,
  limit?: number
}) => {
  return useQuery({
    queryKey: ['threeds', 'logs', params],
    queryFn: () => api.getLogs(params),
    enabled: !!params.account_id,
    refetchInterval: 5000 // Refresh logs every 5 seconds
  })
}
