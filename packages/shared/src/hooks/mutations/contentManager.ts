'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  createContentAccount,
  deleteContentAccount,
  updateContentAccount,
  type CreateAccountPayload,
  type UpdateAccountPayload,
} from '../../apis/contentManager'

export const useCreateContentAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAccountPayload) => createContentAccount(data),
    onSuccess: () => {
      toast.success('Аккаунт добавлен')
      queryClient.invalidateQueries({ queryKey: ['content-manager', 'accounts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || error?.response?.data?.message || 'Не удалось добавить аккаунт')
    },
  })
}

export const useUpdateContentAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ accountId, data }: { accountId: number; data: UpdateAccountPayload }) =>
      updateContentAccount(accountId, data),
    onSuccess: (_data, variables) => {
      toast.success('Аккаунт обновлён')
      queryClient.invalidateQueries({ queryKey: ['content-manager', 'accounts'] })
      queryClient.invalidateQueries({
        queryKey: ['content-manager', 'account', variables.accountId],
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || error?.response?.data?.message || 'Не удалось обновить аккаунт')
    },
  })
}

export const useDeleteContentAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (accountId: number) => deleteContentAccount(accountId),
    onSuccess: () => {
      toast.success('Аккаунт удалён')
      queryClient.invalidateQueries({ queryKey: ['content-manager', 'accounts'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || error?.response?.data?.message || 'Не удалось удалить аккаунт')
    },
  })
}
