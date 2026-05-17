'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { api } from '@/lib/api'
import { finishAuth } from '@/lib/finishAuth'
import { useAkchaStore } from '@/store/useAkchaStore'

type TelegramWidgetUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramWidgetUser) => void
  }
}

type BotInfo = { slug: string; name?: string | null; username: string; bot_type?: string | null }

/**
 * Browser fallback when there is no Telegram Mini App context.
 *
 * 1. Loads bot's @username from GET /bot/{slug}/info.
 * 2. Renders the official telegram-widget.js button.
 * 3. On auth callback, posts the signed widget payload to /auth/widget,
 *    then reuses the same finishAuth flow as the Mini App path.
 */
export function BrowserLoginGate({ slug }: { slug: string }) {
  const t = useTranslations('home')
  const router = useRouter()
  const { setMe, setError } = useAkchaStore()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [bot, setBot] = useState<BotInfo | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get<BotInfo>(`/bot/${slug}/info`)
        if (cancelled) return
        setBot(res.data)
      } catch (err: any) {
        if (cancelled) return
        setLoadError(err?.response?.data?.message ?? err?.message ?? 'Bot info unavailable')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!bot?.username || !containerRef.current) return

    window.onTelegramAuth = async (user: TelegramWidgetUser) => {
      setBusy(true)
      try {
        const authRes = await api.post(`/bot/${slug}/auth/widget`, user)
        const { me } = await finishAuth(authRes.data, slug)
        setMe(me)
        router.replace('/dashboard')
      } catch (err: any) {
        setError(err?.response?.data?.message ?? err?.message ?? 'Login failed')
        setLoadError(err?.response?.data?.message ?? err?.message ?? 'Login failed')
        setBusy(false)
      }
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', bot.username)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(script)

    return () => {
      delete window.onTelegramAuth
    }
  }, [bot, slug, router, setMe, setError])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-2xl font-semibold">{bot?.name ?? t('hello')}</h1>
      {loadError ? (
        <p className="text-sm text-red-600">{loadError}</p>
      ) : !bot ? (
        <p className="text-sm text-muted-foreground">{t('status.pending')}</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{t('browser.signInPrompt')}</p>
          <div ref={containerRef} />
          {busy && <p className="text-sm text-muted-foreground">{t('status.pending')}</p>}
        </>
      )}
    </main>
  )
}
