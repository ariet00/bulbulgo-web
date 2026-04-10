'use client'

import { collectAccountData, generateDrafts, updateAccount, updatePost, publishPost, deletePost, deleteRecommendation } from '../../apis/threeds'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useCollectAccountData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountId: number) => collectAccountData(accountId),
    onSuccess: () => {
      toast.success('Collection task triggered successfully')
      queryClient.invalidateQueries({ queryKey: ['threeds', 'accounts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to trigger collection')
    }
  })
}

export const useGenerateDrafts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountId: number) => generateDrafts(accountId),
    onSuccess: () => {
      toast.success('AI Generation task triggered')
      queryClient.invalidateQueries({ queryKey: ['threeds', 'accounts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to trigger generation')
    }
  })
}

export const useUpdateAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ accountId, data }: { accountId: number, data: any }) => updateAccount(accountId, data),
    onSuccess: () => {
      toast.success('Account updated successfully')
      queryClient.invalidateQueries({ queryKey: ['threeds', 'accounts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update account')
    }
  })
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, data }: { postId: number, data: any }) => updatePost(postId, data),
    onSuccess: () => {
      toast.success('Post updated successfully')
      queryClient.invalidateQueries({ queryKey: ['threeds', 'posts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update post')
    }
  })
}

export const usePublishPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: number) => publishPost(postId),
    onSuccess: () => {
      toast.success('Post published successfully')
      queryClient.invalidateQueries({ queryKey: ['threeds', 'posts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to publish post')
    }
  })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      toast.success('Post deleted')
      queryClient.invalidateQueries({ queryKey: ['threeds', 'posts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to delete post')
    }
  })
}

export const useDeleteRecommendation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: number) => deleteRecommendation(itemId),
    onSuccess: () => {
      toast.success('Recommendation removed')
      queryClient.invalidateQueries({ queryKey: ['threeds', 'recommendations'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to remove item')
    }
  })
}
