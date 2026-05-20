'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { staffApi } from '@/apis/staff'
import {
  api,
  loadAccessToken,
  loadBotSlug,
  setAccessToken,
  setBotSlug,
} from '@/lib/api'
import { getTelegramInit } from '@/lib/telegram'
import { useStaffStore } from '@/store/useStaffStore'

const FALLBACK_BOT_SLUG = process.env.NEXT_PUBLIC_BOT_SLUG || ''

/**
 * Sprint 0: Telegram Mini App-only auth. Resolves bot slug from
 * `?bot=<slug>` → Telegram `start_param` → NEXT_PUBLIC_BOT_SLUG, signs the
 * user in via `/bot/<slug>/auth`, hydrates `/staff/me`, then routes to
 * `/dashboard`.
 *
 * Browser-fallback login (Telegram Login Widget) lands in Sprint 1+.
 */
export function MiniAppBootstrap() {
  const t = useTranslations('home')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { bootStatus, errorMessage, setBootStatus, setError, setMe } =
    useStaffStore()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setBootStatus('pending')

      const urlSlug = searchParams.get('bot')

      // Fast path: reuse cached session.
      const existingToken = loadAccessToken()
      const cachedSlug = urlSlug || loadBotSlug() || FALLBACK_BOT_SLUG
      if (existingToken && cachedSlug) {
        setBotSlug(cachedSlug)
        try {
          const me = await staffApi.me()
          if (cancelled) return
          setMe(me)
          setBootStatus('ready')
          router.replace('/dashboard')
          return
        } catch (err: any) {
          if (cancelled) return
          if (err?.response?.status === 401) {
            setAccessToken(null)
          } else {
            setError(
              err?.response?.data?.message ?? err?.message ?? 'Unknown error',
            )
            return
          }
        }
      }

      const tg = await getTelegramInit()
      if (cancelled) return

      if (!tg || !tg.initData) {
        setBootStatus('no-telegram')
        return
      }

      const startParam = tg.startParam || null
      const slug = urlSlug || startParam || FALLBACK_BOT_SLUG
      if (!slug) {
        setError('Bot slug is not configured. Open the Mini App from the bot.')
        return
      }

      try {
        const authRes = await api.post(`/api/v1/bot/${slug}/auth`, {
          init_data: tg.initData,
        })
        if (cancelled) return

        setAccessToken(authRes.data.access_token)
        setBotSlug(authRes.data.bot?.slug ?? slug)

        const me = await staffApi.me()
        if (cancelled) return

        setMe(me)
        setBootStatus('ready')
        router.replace('/dashboard')
      } catch (err: any) {
        if (cancelled) return
        setError(
          err?.response?.data?.message ?? err?.message ?? 'Unknown error',
        )
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-semibold">{t('hello')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t('tagline')}</p>
      <p className="mt-6 text-sm">
        {bootStatus === 'pending' && t('status.pending')}
        {bootStatus === 'ready' && t('status.ready')}
        {bootStatus === 'no-telegram' && t('status.noTelegram')}
        {bootStatus === 'error' &&
          (errorMessage ? `${t('status.error')}: ${errorMessage}` : t('status.error'))}
      </p>
    </main>
  )
}
