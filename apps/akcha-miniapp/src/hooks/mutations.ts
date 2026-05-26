'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { akchaApi } from '@/apis/akcha'

const invalidate = (qc: ReturnType<typeof useQueryClient>, keys: string[][]) => {
  for (const k of keys) qc.invalidateQueries({ queryKey: ['akcha', ...k] })
}

export const useCreateTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: akchaApi.createTransaction,
    onSuccess: () => invalidate(qc, [['transactions'], ['wallets'], ['me']]),
  })
}

export const useDeleteTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => akchaApi.deleteTransaction(id),
    onSuccess: () => invalidate(qc, [['transactions'], ['wallets'], ['me']]),
  })
}

export const useCreateWallet = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: akchaApi.createWallet,
    onSuccess: () => invalidate(qc, [['wallets'], ['me']]),
  })
}

export const useUpdateWallet = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof akchaApi.updateWallet>[1] }) =>
      akchaApi.updateWallet(id, payload),
    onSuccess: () => invalidate(qc, [['wallets'], ['me']]),
  })
}

export const useSetDefaultWallet = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => akchaApi.setDefaultWallet(id),
    onSuccess: () => invalidate(qc, [['wallets'], ['me']]),
  })
}

export const useDeleteWallet = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: akchaApi.deleteWallet,
    onSuccess: () => invalidate(qc, [['wallets']]),
  })
}

export const useCreateCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: akchaApi.createCategory,
    onSuccess: () => invalidate(qc, [['categories']]),
  })
}

export const useDeleteCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: akchaApi.deleteCategory,
    onSuccess: () => invalidate(qc, [['categories']]),
  })
}

export const useUpdateDebt = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof akchaApi.updateDebt>[1] }) =>
      akchaApi.updateDebt(id, payload),
    onSuccess: () => invalidate(qc, [['debts']]),
  })
}

export const useDeleteDebt = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => akchaApi.deleteDebt(id),
    onSuccess: () => invalidate(qc, [['debts']]),
  })
}
