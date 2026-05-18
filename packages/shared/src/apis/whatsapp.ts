import { requester } from '../lib/requester'
import type { ContentAccount } from './contentManager'

const ACCOUNT_BASE = '/content-manager/whatsapp/accounts'

// ───── Embedded Signup onboarding ────────────────────────────────────────

export interface WhatsAppConfig {
  app_id?: string | null
  config_id?: string | null
  graph_api_version: string
  configured: boolean
}

export const getWhatsAppConfig = async (): Promise<WhatsAppConfig> => {
  const response = await requester.get('/content-manager/whatsapp/config')
  return response.data
}

export interface WhatsAppOnboardingBody {
  code: string
  waba_id: string
  phone_number_id: string
}

export const onboardWhatsApp = async (
  body: WhatsAppOnboardingBody,
): Promise<ContentAccount> => {
  const response = await requester.post('/content-manager/whatsapp/onboard', body)
  return response.data
}

// ───── Inbox ─────────────────────────────────────────────────────────────

export interface WhatsAppConversationSummary {
  id: number
  contact_wa_id: string
  contact_name?: string | null
  last_message_at?: string | null
  last_message_preview?: string | null
  unread_count: number
  free_form_window_open: boolean
}

export const getWhatsAppConversations = async (
  accountId: number,
): Promise<WhatsAppConversationSummary[]> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/conversations`,
  )
  return response.data
}

export interface WhatsAppChatMessage {
  id: number
  wa_message_id: string
  direction: 'inbound' | 'outbound'
  msg_type: string
  body?: string | null
  media_url?: string | null
  media_id?: string | null
  status?: string | null
  error?: string | null
  sent_at: string
  read: boolean
}

export const fetchWhatsAppMediaBlob = async (
  accountId: number,
  mediaId: string,
): Promise<Blob> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/media/${mediaId}`,
    { responseType: 'blob' },
  )
  return response.data
}

export interface InteractiveButtonInput {
  id: string
  title: string
}

export interface SendInteractiveButtonsBody {
  body_text: string
  buttons: InteractiveButtonInput[]
  header_text?: string
  footer_text?: string
}

export const sendWhatsAppInteractive = async (
  accountId: number,
  conversationId: number,
  body: SendInteractiveButtonsBody,
): Promise<{ status: string; wa_message_id?: string }> => {
  const response = await requester.post(
    `${ACCOUNT_BASE}/${accountId}/conversations/${conversationId}/interactive`,
    body,
  )
  return response.data
}

export interface CreateWhatsAppTemplateBody {
  name: string
  language: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  body_text: string
  header_text?: string
  footer_text?: string
}

export const createWhatsAppTemplate = async (
  accountId: number,
  body: CreateWhatsAppTemplateBody,
): Promise<{ id: string; status?: string; category?: string }> => {
  const response = await requester.post(
    `${ACCOUNT_BASE}/${accountId}/templates`,
    body,
  )
  return response.data
}

export const deleteWhatsAppTemplate = async (
  accountId: number,
  templateName: string,
): Promise<{ status: string }> => {
  const response = await requester.delete(
    `${ACCOUNT_BASE}/${accountId}/templates/${encodeURIComponent(templateName)}`,
  )
  return response.data
}

export const getWhatsAppAnalytics = async (
  accountId: number,
  days = 30,
): Promise<any> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/analytics`,
    { params: { days } },
  )
  return response.data
}

export const getWhatsAppMessages = async (
  accountId: number,
  conversationId: number,
): Promise<WhatsAppChatMessage[]> => {
  const response = await requester.get(
    `${ACCOUNT_BASE}/${accountId}/conversations/${conversationId}/messages`,
  )
  return response.data
}

export const sendWhatsAppText = async (
  accountId: number,
  conversationId: number,
  text: string,
): Promise<{ status: string; wa_message_id?: string }> => {
  const response = await requester.post(
    `${ACCOUNT_BASE}/${accountId}/conversations/${conversationId}/messages`,
    { text },
  )
  return response.data
}

export interface SendWhatsAppTemplateBody {
  template_name: string
  language_code: string
  components?: any[]
  to_wa_id?: string
}

export const sendWhatsAppTemplate = async (
  accountId: number,
  conversationId: number,
  body: SendWhatsAppTemplateBody,
): Promise<{ status: string; conversation_id: number; wa_message_id?: string }> => {
  const response = await requester.post(
    `${ACCOUNT_BASE}/${accountId}/conversations/${conversationId}/template`,
    body,
  )
  return response.data
}

// ───── Templates ─────────────────────────────────────────────────────────

export interface WhatsAppTemplate {
  id: string
  name: string
  language: string
  status: string
  category: string
  components?: any[]
}

export const getWhatsAppTemplates = async (
  accountId: number,
): Promise<{ data: WhatsAppTemplate[]; paging?: any }> => {
  const response = await requester.get(`${ACCOUNT_BASE}/${accountId}/templates`)
  return response.data
}
