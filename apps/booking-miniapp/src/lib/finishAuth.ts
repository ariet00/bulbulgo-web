import { api, setAccessToken, setBotSlug } from '@/lib/api'
import type { Business } from '@/types/booking'

type AuthResponse = {
  access_token: string
  bot?: { slug?: string | null } | null
}

export type FinishAuthResult = {
  business: Business
}

/**
 * Persist tokens, fetch the booking business context, and return it.
 * Caller decides where to navigate based on `business.is_owner`.
 */
export async function finishAuth(authData: AuthResponse, fallbackSlug: string): Promise<FinishAuthResult> {
  setAccessToken(authData.access_token)
  setBotSlug(authData.bot?.slug ?? fallbackSlug)

  const biz = await api.get<{
    company: Business['company']
    is_owner: boolean
    settings: Business['settings']
  }>('/api/v1/booking/business')

  return {
    business: {
      company: biz.data.company,
      is_owner: biz.data.is_owner,
      settings: biz.data.settings ?? null,
    },
  }
}
