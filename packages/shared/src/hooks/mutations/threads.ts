'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  collectThreadsAccountData,
  deleteThread,
  deleteThreadsPost,
  deleteThreadsRecommendation,
  generateThreadsDrafts,
  hideThreadsReply,
  publishThreadsPost,
  publishToThreads,
  replyToThread,
  scheduleThreadsDraft,
  startThreadsOAuth,
  submitThreadsAccount2FA,
  updateThreadsPost,
  type ThreadsPublishBody,
} from '../../apis/threads'
import { SCHEDULE_KEY } from '../queries/schedule'

export const useStartThreadsOAuth = () => {
  return useMutation({
    mutationFn: () => startThreadsOAuth(),
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          'Не удалось запустить подключение Threads',
      )
    },
  })
}

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

export const usePublishToThreads = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      body,
    }: {
      accountId: number
      body: ThreadsPublishBody
    }) => publishToThreads(accountId, body),
    onSuccess: (_, vars) => {
      toast.success('Опубликовано в Threads')
      queryClient.invalidateQueries({
        queryKey: ['threads', 'user-threads', vars.accountId],
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Публикация не удалась')
    },
  })
}

export const useDeleteThread = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ accountId, threadId }: { accountId: number; threadId: string }) =>
      deleteThread(accountId, threadId),
    onSuccess: (_, vars) => {
      toast.success('Удалено')
      queryClient.invalidateQueries({
        queryKey: ['threads', 'user-threads', vars.accountId],
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось удалить')
    },
  })
}

export const useHideThreadsReply = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      replyId,
      hide,
    }: {
      accountId: number
      replyId: string
      hide: boolean
    }) => hideThreadsReply(accountId, replyId, hide),
    onSuccess: (_, vars) => {
      toast.success(vars.hide ? 'Ответ скрыт' : 'Ответ снова виден')
      queryClient.invalidateQueries({ queryKey: ['threads', 'replies'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось изменить видимость')
    },
  })
}

export const useReplyToThread = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      mediaId,
      text,
    }: {
      accountId: number
      mediaId: string
      text: string
    }) => replyToThread(accountId, mediaId, text),
    onSuccess: (_, vars) => {
      toast.success('Ответ отправлен')
      queryClient.invalidateQueries({
        queryKey: ['threads', 'replies', vars.accountId, vars.mediaId],
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось ответить')
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

export const useScheduleThreadsDraft = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, scheduledAt, timezone }: { postId: number; scheduledAt: string; timezone?: string }) =>
      scheduleThreadsDraft(postId, { scheduled_at: scheduledAt, timezone }),
    onSuccess: () => {
      toast.success('Черновик запланирован')
      queryClient.invalidateQueries({ queryKey: ['threads', 'posts'] })
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось запланировать черновик')
    },
  })
}
