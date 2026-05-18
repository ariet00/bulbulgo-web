'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  createWhatsAppTemplate,
  deleteWhatsAppTemplate,
  onboardWhatsApp,
  sendWhatsAppInteractive,
  sendWhatsAppTemplate,
  sendWhatsAppText,
  type CreateWhatsAppTemplateBody,
  type SendInteractiveButtonsBody,
  type SendWhatsAppTemplateBody,
  type WhatsAppOnboardingBody,
} from '../../apis/whatsapp'

export const useOnboardWhatsApp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: WhatsAppOnboardingBody) => onboardWhatsApp(body),
    onSuccess: () => {
      toast.success('WhatsApp Business подключён')
      queryClient.invalidateQueries({ queryKey: ['content-accounts'] })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          'Не удалось завершить подключение WhatsApp',
      )
    },
  })
}

export const useSendWhatsAppText = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      conversationId,
      text,
    }: {
      accountId: number
      conversationId: number
      text: string
    }) => sendWhatsAppText(accountId, conversationId, text),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['whatsapp', 'messages', vars.accountId, vars.conversationId],
      })
      queryClient.invalidateQueries({
        queryKey: ['whatsapp', 'conversations', vars.accountId],
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось отправить')
    },
  })
}

export const useSendWhatsAppTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      conversationId,
      body,
    }: {
      accountId: number
      conversationId: number
      body: SendWhatsAppTemplateBody
    }) => sendWhatsAppTemplate(accountId, conversationId, body),
    onSuccess: (_, vars) => {
      toast.success('Шаблон отправлен')
      queryClient.invalidateQueries({
        queryKey: ['whatsapp', 'conversations', vars.accountId],
      })
      queryClient.invalidateQueries({
        queryKey: ['whatsapp', 'messages', vars.accountId],
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось отправить шаблон')
    },
  })
}

export const useSendWhatsAppInteractive = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      conversationId,
      body,
    }: {
      accountId: number
      conversationId: number
      body: SendInteractiveButtonsBody
    }) => sendWhatsAppInteractive(accountId, conversationId, body),
    onSuccess: (_, vars) => {
      toast.success('Кнопки отправлены')
      queryClient.invalidateQueries({
        queryKey: ['whatsapp', 'messages', vars.accountId, vars.conversationId],
      })
      queryClient.invalidateQueries({
        queryKey: ['whatsapp', 'conversations', vars.accountId],
      })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Не удалось отправить интерактивное сообщение',
      )
    },
  })
}

export const useCreateWhatsAppTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      body,
    }: {
      accountId: number
      body: CreateWhatsAppTemplateBody
    }) => createWhatsAppTemplate(accountId, body),
    onSuccess: (_, vars) => {
      toast.success('Шаблон отправлен на модерацию Meta')
      queryClient.invalidateQueries({
        queryKey: ['whatsapp', 'templates', vars.accountId],
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось создать шаблон')
    },
  })
}

export const useDeleteWhatsAppTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      accountId,
      templateName,
    }: {
      accountId: number
      templateName: string
    }) => deleteWhatsAppTemplate(accountId, templateName),
    onSuccess: (_, vars) => {
      toast.success('Шаблон удалён')
      queryClient.invalidateQueries({
        queryKey: ['whatsapp', 'templates', vars.accountId],
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Не удалось удалить шаблон')
    },
  })
}
