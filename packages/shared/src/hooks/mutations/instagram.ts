'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  deleteInstagramComment,
  hideInstagramComment,
  publishToInstagram,
  replyInstagramComment,
  sendInstagramMessage,
  startInstagramOAuth,
  type InstagramPublishBody,
} from '../../apis/instagram'

export const useStartInstagramOAuth = () => {
  return useMutation({
    mutationFn: () => startInstagramOAuth(),
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          'Не удалось запустить подключение Instagram',
      )
    },
  })
}

export const usePublishToInstagram = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      body,
    }: {
      accountId: number
      body: InstagramPublishBody
    }) => publishToInstagram(accountId, body),
    onSuccess: () => {
      toast.success('Опубликовано в Instagram')
      queryClient.invalidateQueries({ queryKey: ['instagram', 'media'] })
      queryClient.invalidateQueries({ queryKey: ['content-accounts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Публикация не удалась')
    },
  })
}

export const useReplyInstagramComment = () => {
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
    }) => replyInstagramComment(accountId, commentId, message),
    onSuccess: () => {
      toast.success('Ответ отправлен')
      queryClient.invalidateQueries({ queryKey: ['instagram', 'comments'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось ответить')
    },
  })
}

export const useHideInstagramComment = () => {
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
    }) => hideInstagramComment(accountId, commentId, hide),
    onSuccess: (_, vars) => {
      toast.success(vars.hide ? 'Комментарий скрыт' : 'Комментарий снова виден')
      queryClient.invalidateQueries({ queryKey: ['instagram', 'comments'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось изменить видимость')
    },
  })
}

export const useDeleteInstagramComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      commentId,
    }: {
      accountId: number
      commentId: string
    }) => deleteInstagramComment(accountId, commentId),
    onSuccess: () => {
      toast.success('Комментарий удалён')
      queryClient.invalidateQueries({ queryKey: ['instagram', 'comments'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось удалить')
    },
  })
}

export const useSendInstagramMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      conversationId,
      body,
    }: {
      accountId: number
      conversationId: number
      body: { text?: string; attachment_url?: string; attachment_type?: string }
    }) => sendInstagramMessage(accountId, conversationId, body),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['instagram', 'conversation', vars.accountId, vars.conversationId],
      })
      queryClient.invalidateQueries({
        queryKey: ['instagram', 'conversations', vars.accountId],
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось отправить сообщение')
    },
  })
}
