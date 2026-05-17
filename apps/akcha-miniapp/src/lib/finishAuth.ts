import { api, setAccessToken, setBotSlug } from '@/lib/api'
import { akchaApi } from '@/apis/akcha'
import type { AkchaMe } from '@/types/akcha'

type AuthResponse = {
  access_token: string
  bot?: { slug?: string | null } | null
}

export interface FinishAuthResult {
  me: AkchaMe
}

/** Persist tokens, fetch /akcha/me (bootstraps defaults), return it. */
export async function finishAuth(authData: AuthResponse, fallbackSlug: string): Promise<FinishAuthResult> {
  setAccessToken(authData.access_token)
  setBotSlug(authData.bot?.slug ?? fallbackSlug)
  const me = await akchaApi.me()
  return { me }
}
