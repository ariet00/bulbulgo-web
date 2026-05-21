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

// Telegram themeParams → our CSS custom properties (defined in packages/ui/src/globals.css).
// Telegram sends hex strings; the CSS vars happily hold any color string.
const THEME_MAP: Record<string, string[]> = {
  bg_color: ['--background'],
  text_color: ['--foreground', '--card-foreground', '--popover-foreground'],
  secondary_bg_color: ['--card', '--popover', '--muted', '--secondary', '--accent'],
  hint_color: ['--muted-foreground', '--border', '--input'],
  button_color: ['--primary', '--ring'],
  button_text_color: ['--primary-foreground'],
}

function readParam(params: Record<string, any>, snake: string): string | undefined {
  if (params[snake]) return params[snake]
  const camel = snake.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
  return params[camel]
}

/** Sync the Mini App palette + light/dark mode with the host Telegram theme. */
export async function applyTelegramTheme(): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const { default: WebApp } = await import('@twa-dev/sdk')
    const root = document.documentElement

    const isDark = WebApp.colorScheme === 'dark'
    root.classList.toggle('dark', isDark)
    root.classList.toggle('light', !isDark)

    const params = (WebApp.themeParams ?? {}) as Record<string, any>
    for (const [tgKey, cssVars] of Object.entries(THEME_MAP)) {
      const value = readParam(params, tgKey)
      if (!value) continue
      for (const cssVar of cssVars) root.style.setProperty(cssVar, value)
    }

    const bg = readParam(params, 'bg_color')
    const header = readParam(params, 'secondary_bg_color') || bg
    try {
      if (bg) WebApp.setBackgroundColor(bg as `#${string}`)
      if (header) WebApp.setHeaderColor(header as `#${string}`)
    } catch {
      /* older Telegram clients reject explicit colors — ignore */
    }
  } catch (err) {
    console.warn('applyTelegramTheme failed:', err)
  }
}

/** Subscribe to live Telegram theme changes. Returns an unsubscribe fn. */
export async function subscribeTelegramTheme(cb: () => void): Promise<() => void> {
  if (typeof window === 'undefined') return () => {}
  try {
    const { default: WebApp } = await import('@twa-dev/sdk')
    WebApp.onEvent('themeChanged', cb)
    return () => WebApp.offEvent('themeChanged', cb)
  } catch {
    return () => {}
  }
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
