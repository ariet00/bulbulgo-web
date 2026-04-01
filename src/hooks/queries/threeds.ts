import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/apis/threeds'

export const useThreedsAccounts = () => {
  return useQuery({
    queryKey: ['threeds', 'accounts'],
    queryFn: api.getAccounts,
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

export const useThreedsPosts = () => {
  return useQuery({
    queryKey: ['threeds', 'posts'],
    queryFn: api.getGeneratedPosts,
  })
}

export const useThreedsRecommendations = () => {
  return useQuery({
    queryKey: ['threeds', 'recommendations'],
    queryFn: api.getRecommendations,
  })
}
