import { useQuery } from '@tanstack/react-query'
import * as api from '@/apis/threeds'

export const useThreedsAccounts = () => {
  return useQuery({
    queryKey: ['threeds', 'accounts'],
    queryFn: api.getAccounts,
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
