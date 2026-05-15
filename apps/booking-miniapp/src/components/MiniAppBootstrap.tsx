'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { api, setAccessToken, setBotSlug } from '@/lib/api'
import { getTelegramInit } from '@/lib/telegram'
import { useBookingStore } from '@/store/useBookingStore'
import type { Business } from '@/types/booking'

const FALLBACK_BOT_SLUG = process.env.NEXT_PUBLIC_BOT_SLUG || 'booking-bot'

/**
 * Mini App entry: validates Telegram initData with the backend, stores
 * the access token + bot slug, fetches the business context, and routes
 * to the client or owner home page.
 */
export function MiniAppBootstrap() {
  const t = useTranslations('home')
  const router = useRouter()
  const { bootStatus, errorMessage, setBootStatus, setError, setBusiness } = useBookingStore()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setBootStatus('pending')
      const tg = await getTelegramInit()
      if (cancelled) return

      if (!tg || !tg.initData) {
        setBootStatus('no-telegram')
        return
      }

      try {
        const slug = FALLBACK_BOT_SLUG
        const authRes = await api.post(`/api/v1/bot/${slug}/auth`, {
          init_data: tg.initData,
        })
        if (cancelled) return

        setAccessToken(authRes.data.access_token)
        setBotSlug(authRes.data.bot?.slug ?? slug)

        const biz = await api.get<{ company: Business['company']; is_owner: boolean; settings: Business['settings'] }>(
          '/api/v1/booking/business',
        )
        if (cancelled) return

        const business: Business = {
          company: biz.data.company,
          is_owner: biz.data.is_owner,
          settings: biz.data.settings ?? null,
        }
        setBusiness(business)
        setBootStatus('ready')

        router.replace(business.is_owner ? '/owner' : '/book')
      } catch (err: any) {
        if (cancelled) return
        setError(err?.response?.data?.message ?? err?.message ?? 'Unknown error')
        setBootStatus('error')
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
      <p className="mt-3 text-sm text-muted-foreground">
        {bootStatus === 'pending' && t('status.pending')}
        {bootStatus === 'ready' && t('status.ready')}
        {bootStatus === 'no-telegram' && t('status.noTelegram')}
        {bootStatus === 'error' && (errorMessage ? `${t('status.error')}: ${errorMessage}` : t('status.error'))}
      </p>
    </main>
  )
}
