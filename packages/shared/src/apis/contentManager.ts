import { requester } from '../lib/requester'

export type Platform = 'instagram' | 'whatsapp' | 'threads' | 'tiktok' | 'telegram'

export interface ContentAccount {
  id: number
  platform: Platform
  username: string
  display_name?: string | null
  is_active: boolean
  credentials: Record<string, any>
  data: Record<string, any>
}

export interface CreateAccountPayload {
  platform: Platform
  username: string
  display_name?: string
  credentials?: Record<string, any>
  data?: Record<string, any>
}

export interface UpdateAccountPayload {
  username?: string
  display_name?: string
  is_active?: boolean
  credentials?: Record<string, any>
  data?: Record<string, any>
}

export const getContentAccounts = async (platform?: Platform): Promise<ContentAccount[]> => {
  const response = await requester.get('/content-manager/accounts/', {
    params: platform ? { platform } : undefined,
  })
  return response.data
}

export const getContentAccount = async (accountId: number): Promise<ContentAccount> => {
  const response = await requester.get(`/content-manager/accounts/${accountId}`)
  return response.data
}

export const createContentAccount = async (
  data: CreateAccountPayload,
): Promise<ContentAccount> => {
  const response = await requester.post('/content-manager/accounts/', data)
  return response.data
}

export const updateContentAccount = async (
  accountId: number,
  data: UpdateAccountPayload,
): Promise<ContentAccount> => {
  const response = await requester.patch(`/content-manager/accounts/${accountId}`, data)
  return response.data
}

export const deleteContentAccount = async (accountId: number): Promise<void> => {
  await requester.delete(`/content-manager/accounts/${accountId}`)
}
