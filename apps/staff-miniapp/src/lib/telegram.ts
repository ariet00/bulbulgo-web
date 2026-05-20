/**
 * Thin wrapper around @twa-dev/sdk that's safe to import from server components.
 * The SDK touches `window` at module top-level, so we lazy-load it on the client.
 */
export type TelegramUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

export type TelegramInit = {
  initData: string
  user: TelegramUser | null
  startParam: string | null
}

export async function getTelegramInit(): Promise<TelegramInit | null> {
  if (typeof window === 'undefined') return null
  try {
    const { default: WebApp } = await import('@twa-dev/sdk')
    WebApp.ready()
    WebApp.expand()
    return {
      initData: WebApp.initData,
      user: (WebApp.initDataUnsafe?.user as TelegramUser | undefined) ?? null,
      startParam: (WebApp.initDataUnsafe as any)?.start_param ?? null,
    }
  } catch (err) {
    console.warn('Telegram WebApp SDK unavailable:', err)
    return null
  }
}
