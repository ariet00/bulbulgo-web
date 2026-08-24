import { api } from '@/apis/client'
import type {
  Account,
  AccountBulkInput,
  AccountCheckResult,
  AccountInput,
  AccountProfileInput,
  AccountSession,
  AccountUpdateInput,
  AccountsPage,
  SpamBlock,
} from '@/types'

export interface AccountFilters {
  page?: number
  size?: number
  project_id?: number
  status?: string
  q?: string
}

export async function getAccounts(filters: AccountFilters = {}) {
  const { data } = await api.get<AccountsPage>('/tglab/accounts', { params: filters })
  return data
}

export async function createAccount(payload: AccountInput) {
  const { data } = await api.post<Account>('/tglab/accounts', payload)
  return data
}

/** Import a bought account as it ships: `.session` + optional `.json`. */
export async function importAccountFile(payload: {
  sessionFile: File
  metaFile?: File | null
  projectId?: number | null
  proxyId?: number | null
}) {
  const form = new FormData()
  form.append('session_file', payload.sessionFile)
  if (payload.metaFile) form.append('meta_file', payload.metaFile)
  if (payload.projectId) form.append('project_id', String(payload.projectId))
  if (payload.proxyId) form.append('proxy_id', String(payload.proxyId))
  const { data } = await api.post<Account>('/tglab/accounts/import-file', form)
  return data
}

export async function updateAccount(id: number, payload: AccountUpdateInput) {
  const { data } = await api.patch<Account>(`/tglab/accounts/${id}`, payload)
  return data
}

export async function bulkUpdateAccounts(payload: AccountBulkInput) {
  const { data } = await api.post<Account[]>('/tglab/accounts/bulk', payload)
  return data
}

export async function deleteAccount(id: number) {
  const { data } = await api.delete(`/tglab/accounts/${id}`)
  return data
}

export async function bulkDeleteAccounts(ids: number[]) {
  const { data } = await api.post<{ deleted: number }>('/tglab/accounts/bulk-delete', ids)
  return data
}

export async function checkAccount(id: number) {
  const { data } = await api.post<AccountCheckResult>(`/tglab/accounts/${id}/check`)
  return data
}

export async function updateAccountProfile(id: number, payload: AccountProfileInput) {
  const { data } = await api.patch<Account>(`/tglab/accounts/${id}/profile`, payload)
  return data
}

export async function getAccountSessions(id: number) {
  const { data } = await api.get<AccountSession[]>(`/tglab/accounts/${id}/sessions`)
  return data
}

export async function terminateAccountSessions(id: number) {
  const { data } = await api.post(`/tglab/accounts/${id}/sessions/terminate-others`)
  return data
}

export async function checkAccountSpamBlock(id: number) {
  const { data } = await api.post<SpamBlock>(`/tglab/accounts/${id}/spam-check`)
  return data
}
