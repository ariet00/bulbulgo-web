'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  createInstagramAccount,
  createTelegramAccount,
  createTikTokAccount,
  createWhatsAppAccount,
  deleteContentAccount,
  updateContentAccount,
  type CreateInstagramAccountBody,
  type CreateTelegramAccountBody,
  type CreateTikTokAccountBody,
  type CreateWhatsAppAccountBody,
  type Platform,
  type UpdateAccountPayload,
} from '../../apis/contentManager'

function describeError(error: any, fallback: string): string {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    fallback
  )
}

function invalidateAccounts(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['content-manager', 'accounts'] })
}

export const useCreateInstagramAccount = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInstagramAccountBody) => createInstagramAccount(data),
    onSuccess: () => {
      toast.success('Аккаунт добавлен')
      invalidateAccounts(qc)
    },
    onError: (e: any) => toast.error(describeError(e, 'Не удалось добавить аккаунт')),
  })
}

export const useCreateTikTokAccount = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTikTokAccountBody) => createTikTokAccount(data),
    onSuccess: () => {
      toast.success('Аккаунт добавлен')
      invalidateAccounts(qc)
    },
    onError: (e: any) => toast.error(describeError(e, 'Не удалось добавить аккаунт')),
  })
}

export const useCreateWhatsAppAccount = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWhatsAppAccountBody) => createWhatsAppAccount(data),
    onSuccess: () => {
      toast.success('Аккаунт добавлен')
      invalidateAccounts(qc)
    },
    onError: (e: any) => toast.error(describeError(e, 'Не удалось добавить аккаунт')),
  })
}

export const useCreateTelegramAccount = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTelegramAccountBody) => createTelegramAccount(data),
    onSuccess: () => {
      toast.success('Аккаунт добавлен')
      invalidateAccounts(qc)
    },
    onError: (e: any) => toast.error(describeError(e, 'Не удалось добавить аккаунт')),
  })
}

export const useUpdateContentAccount = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      platform,
      accountId,
      data,
    }: {
      platform: Platform
      accountId: number
      data: UpdateAccountPayload
    }) => updateContentAccount(platform, accountId, data),
    onSuccess: (_data, variables) => {
      toast.success('Аккаунт обновлён')
      invalidateAccounts(qc)
      qc.invalidateQueries({
        queryKey: ['content-manager', 'account', variables.platform, variables.accountId],
      })
    },
    onError: (e: any) => toast.error(describeError(e, 'Не удалось обновить аккаунт')),
  })
}

export const useDeleteContentAccount = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ platform, accountId }: { platform: Platform; accountId: number }) =>
      deleteContentAccount(platform, accountId),
    onSuccess: () => {
      toast.success('Аккаунт удалён')
      invalidateAccounts(qc)
    },
    onError: (e: any) => toast.error(describeError(e, 'Не удалось удалить аккаунт')),
  })
}
