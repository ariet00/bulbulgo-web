import { requester } from '../lib/requester'

// Mirrors backend `apps/content_manager/models.py:Platform`. Single source for
// every platform-keyed UI map (labels here, visuals in the consuming app).
export const PLATFORMS = [
  'instagram',
  'whatsapp',
  'threads',
  'tiktok',
  'telegram',
  'pages',
] as const
export type Platform = (typeof PLATFORMS)[number]

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  threads: 'Threads',
  tiktok: 'TikTok',
  telegram: 'Telegram',
  pages: 'Facebook Page',
}

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

export interface CreateInstagramAccountBody {
  username: string
  display_name?: string
  access_token: string
}
export interface CreateTikTokAccountBody {
  username: string
  display_name?: string
  access_token: string
}
export interface CreateWhatsAppAccountBody {
  phone: string
  display_name?: string
  api_token: string
}
export interface CreateTelegramAccountBody {
  bot_token: string
  display_name?: string
}

export const createInstagramAccount = async (
  data: CreateInstagramAccountBody,
): Promise<ContentAccount> => {
  const response = await requester.post('/content-manager/instagram/accounts/', data)
  return response.data
}
export const createTikTokAccount = async (
  data: CreateTikTokAccountBody,
): Promise<ContentAccount> => {
  const response = await requester.post('/content-manager/tiktok/accounts/', data)
  return response.data
}
export const createWhatsAppAccount = async (
  data: CreateWhatsAppAccountBody,
): Promise<ContentAccount> => {
  const response = await requester.post('/content-manager/whatsapp/accounts/', data)
  return response.data
}
export const createTelegramAccount = async (
  data: CreateTelegramAccountBody,
): Promise<ContentAccount> => {
  const response = await requester.post('/content-manager/telegram/accounts/', data)
  return response.data
}

function accountPath(platform: Platform, accountId: number): string {
  return `/content-manager/${platform}/accounts/${accountId}`
}

export const updateContentAccount = async (
  platform: Platform,
  accountId: number,
  data: UpdateAccountPayload,
): Promise<ContentAccount> => {
  const response = await requester.patch(accountPath(platform, accountId), data)
  return response.data
}

export const deleteContentAccount = async (
  platform: Platform,
  accountId: number,
): Promise<void> => {
  await requester.delete(accountPath(platform, accountId))
}
