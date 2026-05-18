'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  deletePageComment,
  deletePagePost,
  hidePageComment,
  publishToPage,
  replyPageComment,
  startPagesOAuth,
  type PagePublishBody,
} from '../../apis/pages'

export const useStartPagesOAuth = () => {
  return useMutation({
    mutationFn: () => startPagesOAuth(),
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Не удалось запустить подключение Facebook',
      )
    },
  })
}

export const usePublishToPage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      body,
    }: {
      accountId: number
      body: PagePublishBody
    }) => publishToPage(accountId, body),
    onSuccess: (_, vars) => {
      toast.success('Опубликовано на странице')
      queryClient.invalidateQueries({ queryKey: ['pages', 'posts', vars.accountId] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Публикация не удалась')
    },
  })
}

export const useDeletePagePost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ accountId, postId }: { accountId: number; postId: string }) =>
      deletePagePost(accountId, postId),
    onSuccess: (_, vars) => {
      toast.success('Пост удалён')
      queryClient.invalidateQueries({ queryKey: ['pages', 'posts', vars.accountId] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось удалить')
    },
  })
}

export const useReplyPageComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      commentId,
      message,
    }: {
      accountId: number
      commentId: string
      message: string
    }) => replyPageComment(accountId, commentId, message),
    onSuccess: () => {
      toast.success('Ответ отправлен')
      queryClient.invalidateQueries({ queryKey: ['pages', 'comments'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось ответить')
    },
  })
}

export const useHidePageComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      commentId,
      hide,
    }: {
      accountId: number
      commentId: string
      hide: boolean
    }) => hidePageComment(accountId, commentId, hide),
    onSuccess: (_, vars) => {
      toast.success(vars.hide ? 'Комментарий скрыт' : 'Снова виден')
      queryClient.invalidateQueries({ queryKey: ['pages', 'comments'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось изменить видимость')
    },
  })
}

export const useDeletePageComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      commentId,
    }: {
      accountId: number
      commentId: string
    }) => deletePageComment(accountId, commentId),
    onSuccess: () => {
      toast.success('Комментарий удалён')
      queryClient.invalidateQueries({ queryKey: ['pages', 'comments'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось удалить')
    },
  })
}
