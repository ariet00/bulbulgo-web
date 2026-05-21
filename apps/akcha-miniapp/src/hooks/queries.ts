'use client'

import { useQuery } from '@tanstack/react-query'

import { akchaApi, type TxFilters } from '@/apis/akcha'

const KEY_ROOT = ['akcha'] as const

export const useMe = (enabled = true) =>
  useQuery({
    queryKey: [...KEY_ROOT, 'me'],
    queryFn: akchaApi.me,
    enabled,
  })

export const useWallets = () =>
  useQuery({
    queryKey: [...KEY_ROOT, 'wallets'],
    queryFn: akchaApi.listWallets,
  })

export const useCategories = (type?: 'income' | 'expense') =>
  useQuery({
    queryKey: [...KEY_ROOT, 'categories', type ?? 'all'],
    queryFn: () => akchaApi.listCategories(type),
  })

export const useTransactions = (filters: TxFilters = {}) =>
  useQuery({
    queryKey: [...KEY_ROOT, 'transactions', filters],
    queryFn: () => akchaApi.listTransactions(filters),
  })

export const useDebts = (
  params: {
    type?: 'i_owe' | 'they_owe'
    is_closed?: boolean
    counterparty_id?: number
    from?: string
    to?: string
  } = {},
) =>
  useQuery({
    queryKey: [...KEY_ROOT, 'debts', params],
    queryFn: () => akchaApi.listDebts(params),
  })
