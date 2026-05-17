'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { akchaApi } from '@/apis/akcha'
import { api, loadAccessToken, loadBotSlug, setAccessToken, setBotSlug } from '@/lib/api'
import { finishAuth } from '@/lib/finishAuth'
import { getTelegramInit } from '@/lib/telegram'
import { useAkchaStore } from '@/store/useAkchaStore'
import { BrowserLoginGate } from './BrowserLoginGate'

const FALLBACK_BOT_SLUG = process.env.NEXT_PUBLIC_BOT_SLUG || 'akcha'

/**
 * Entry: tries Telegram Mini App auth first (signed initData). Falls back to
 * the Telegram Login Widget when opened outside Telegram.
 *
 * Bot slug resolution priority:
 *   1. `?bot=<slug>` query param
 *   2. Telegram WebApp `start_param`
 *   3. `NEXT_PUBLIC_BOT_SLUG` env (defaults to 'akcha')
 */
export function MiniAppBootstrap() {
  const t = useTranslations('home')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { bootStatus, errorMessage, setBootStatus, setError, setMe } = useAkchaStore()
  const [browserSlug, setBrowserSlug] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setBootStatus('pending')

      const urlSlug = searchParams.get('bot')

      // Fast path: reuse existing session.
      const existingToken = loadAccessToken()
      const cachedSlug = urlSlug || loadBotSlug() || FALLBACK_BOT_SLUG
      if (existingToken && cachedSlug) {
        setBotSlug(cachedSlug)
        try {
          const me = await akchaApi.me()
          if (cancelled) return
          setMe(me)
          setBootStatus('ready')
          router.replace('/dashboard')
          return
        } catch (err: any) {
          if (cancelled) return
          if (err?.response?.status === 401) {
            setAccessToken(null)
            // fall through to full auth
          } else {
            setError(err?.response?.data?.message ?? err?.message ?? 'Unknown error')
            return
          }
        }
      }

      const tg = await getTelegramInit()
      if (cancelled) return

      if (!tg || !tg.initData) {
        const slug = urlSlug || FALLBACK_BOT_SLUG
        if (!slug) {
          setError('Bot slug is not configured. Open with ?bot=<slug>.')
          return
        }
        setBrowserSlug(slug)
        setBootStatus('no-telegram')
        return
      }

      const startParam = tg.startParam || null
      const slug = urlSlug || startParam || FALLBACK_BOT_SLUG

      try {
        const authRes = await api.post(`/api/v1/bot/${slug}/auth`, { init_data: tg.initData })
        if (cancelled) return
        const { me } = await finishAuth(authRes.data, slug)
        if (cancelled) return
        setMe(me)
        setBootStatus('ready')
        router.replace('/dashboard')
      } catch (err: any) {
        if (cancelled) return
        setError(err?.response?.data?.message ?? err?.message ?? 'Unknown error')
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (bootStatus === 'no-telegram' && browserSlug) {
    return <BrowserLoginGate slug={browserSlug} />
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-semibold">{t('hello')}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {bootStatus === 'pending' && t('status.pending')}
        {bootStatus === 'ready' && t('status.ready')}
        {bootStatus === 'error' && (errorMessage ? `${t('status.error')}: ${errorMessage}` : t('status.error'))}
      </p>
    </main>
  )
}
