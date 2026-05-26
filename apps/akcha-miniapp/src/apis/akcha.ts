import { api } from '@/lib/api'
import type {
  AkchaMe,
  Debt,
  FinanceCategory,
  Transaction,
  UserSettings,
  Wallet,
} from '@/types/akcha'

const root = '/akcha'

export interface TxFilters {
  wallet_id?: number
  type?: 'income' | 'expense'
  category_id?: number
  from?: string
  to?: string
  skip?: number
  limit?: number
}

export type DebtUpdatePayload = Partial<
  Pick<Debt, 'amount' | 'type' | 'due_date' | 'description' | 'is_closed' | 'contractor_id'>
>

export const akchaApi = {
  me: () => api.get<AkchaMe>(`${root}/me/`).then(r => r.data),
  updateMe: (payload: {
    currency_id?: number
    currency_code?: string
    timezone?: string
    data?: Record<string, any>
  }) => api.patch<UserSettings>(`${root}/me/`, payload).then(r => r.data),

  listWallets: () => api.get<Wallet[]>(`${root}/wallets/`).then(r => r.data),
  createWallet: (payload: Partial<Wallet>) =>
    api.post<Wallet>(`${root}/wallets/`, payload).then(r => r.data),
  updateWallet: (id: number, payload: Partial<Wallet>) =>
    api.put<Wallet>(`${root}/wallets/${id}`, payload).then(r => r.data),
  setDefaultWallet: (id: number) =>
    api.put<Wallet>(`${root}/wallets/${id}/default`).then(r => r.data),
  deleteWallet: (id: number) =>
    api.delete<Wallet>(`${root}/wallets/${id}`).then(r => r.data),

  listCategories: (type?: 'income' | 'expense') =>
    api.get<FinanceCategory[]>(`${root}/categories/`, { params: { type } }).then(r => r.data),
  createCategory: (payload: Partial<FinanceCategory>) =>
    api.post<FinanceCategory>(`${root}/categories/`, payload).then(r => r.data),
  updateCategory: (id: number, payload: Partial<FinanceCategory>) =>
    api.put<FinanceCategory>(`${root}/categories/${id}`, payload).then(r => r.data),
  deleteCategory: (id: number) =>
    api.delete<FinanceCategory>(`${root}/categories/${id}`).then(r => r.data),

  listTransactions: (filters: TxFilters = {}) =>
    api.get<Transaction[]>(`${root}/transactions/`, { params: filters }).then(r => r.data),
  createTransaction: (payload: {
    wallet_id: number
    amount: number
    type: 'income' | 'expense'
    description?: string
    category_id?: number
    date?: string
  }) => api.post<Transaction>(`${root}/transactions/`, payload).then(r => r.data),
  deleteTransaction: (id: number) =>
    api.delete<Transaction>(`${root}/transactions/${id}`).then(r => r.data),
  exportTransactionsUrl: (filters: TxFilters & { format?: 'csv' | 'xlsx' } = {}) => {
    const params = new URLSearchParams({ format: filters.format ?? 'csv' })
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.type) params.set('type', filters.type)
    if (filters.wallet_id) params.set('wallet_id', String(filters.wallet_id))
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008/api/v1'
    return `${baseURL}${root}/transactions/export?${params.toString()}`
  },

  listDebts: (
    params: {
      type?: 'i_owe' | 'they_owe'
      is_closed?: boolean
      contractor_id?: number
      from?: string
      to?: string
    } = {},
  ) => api.get<Debt[]>(`${root}/debts/`, { params }).then(r => r.data),
  updateDebt: (id: number, payload: DebtUpdatePayload) =>
    api.put<Debt>(`${root}/debts/${id}`, payload).then(r => r.data),
  deleteDebt: (id: number) =>
    api.delete<Debt>(`${root}/debts/${id}`).then(r => r.data),
}
