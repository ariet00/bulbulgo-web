'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  collectThreadsAccountData,
  deleteThreadsPost,
  deleteThreadsRecommendation,
  generateThreadsDrafts,
  publishThreadsPost,
  submitThreadsAccount2FA,
  updateThreadsPost,
} from '../../apis/threads'

export const useSubmitThreads2FA = () => {
  return useMutation({
    mutationFn: ({ accountId, code }: { accountId: number; code: string }) =>
      submitThreadsAccount2FA(accountId, code),
  })
}

export const useCollectThreadsData = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (accountId: number) => collectThreadsAccountData(accountId),
    onSuccess: () => {
      toast.success('Сбор трендов запущен')
      queryClient.invalidateQueries({ queryKey: ['threads', 'recommendations'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось запустить сбор')
    },
  })
}

export const useGenerateThreadsDrafts = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (accountId: number) => generateThreadsDrafts(accountId),
    onSuccess: () => {
      toast.success('Генерация черновиков запущена')
      queryClient.invalidateQueries({ queryKey: ['threads', 'posts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось запустить генерацию')
    },
  })
}

export const useUpdateThreadsPost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, data }: { postId: number; data: any }) =>
      updateThreadsPost(postId, data),
    onSuccess: () => {
      toast.success('Пост обновлён')
      queryClient.invalidateQueries({ queryKey: ['threads', 'posts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось обновить пост')
    },
  })
}

export const usePublishThreadsPost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: number) => publishThreadsPost(postId),
    onSuccess: () => {
      toast.success('Пост опубликован')
      queryClient.invalidateQueries({ queryKey: ['threads', 'posts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось опубликовать пост')
    },
  })
}

export const useDeleteThreadsPost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: number) => deleteThreadsPost(postId),
    onSuccess: () => {
      toast.success('Пост удалён')
      queryClient.invalidateQueries({ queryKey: ['threads', 'posts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось удалить пост')
    },
  })
}

export const useDeleteThreadsRecommendation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: number) => deleteThreadsRecommendation(itemId),
    onSuccess: () => {
      toast.success('Рекомендация удалена')
      queryClient.invalidateQueries({ queryKey: ['threads', 'recommendations'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось удалить рекомендацию')
    },
  })
}
