'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { api } from '@/lib/api'
import { finishAuth } from '@/lib/finishAuth'
import { getTelegramInit } from '@/lib/telegram'
import { useBookingStore } from '@/store/useBookingStore'
import { BrowserLoginGate } from './BrowserLoginGate'

const FALLBACK_BOT_SLUG = process.env.NEXT_PUBLIC_BOT_SLUG || ''

/**
 * Entry: tries Telegram Mini App auth first (signed initData). If the page
 * is opened outside Telegram, falls back to <BrowserLoginGate> which renders
 * the official Telegram Login Widget button.
 *
 * Bot slug resolution priority:
 *   1. `?bot=<slug>` query param
 *   2. Telegram WebApp `start_param` (mini-app only)
 *   3. `NEXT_PUBLIC_BOT_SLUG` env (legacy single-bot fallback)
 */
export function MiniAppBootstrap() {
  const t = useTranslations('home')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { bootStatus, errorMessage, setBootStatus, setError, setBusiness } = useBookingStore()
  const [browserSlug, setBrowserSlug] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setBootStatus('pending')
      const tg = await getTelegramInit()
      if (cancelled) return

      const urlSlug = searchParams.get('bot')

      if (!tg || !tg.initData) {
        const slug = urlSlug || FALLBACK_BOT_SLUG
        if (!slug) {
          setError('Bot slug is not configured. Open with ?bot=<slug>.')
          setBootStatus('error')
          return
        }
        setBrowserSlug(slug)
        setBootStatus('no-telegram')
        return
      }

      const startParam = tg.startParam || null
      const slug = urlSlug || startParam || FALLBACK_BOT_SLUG
      if (!slug) {
        setError('Bot slug is not configured. Open the Mini App from the bot.')
        setBootStatus('error')
        return
      }

      try {
        const authRes = await api.post(`/api/v1/bot/${slug}/auth`, {
          init_data: tg.initData,
        })
        if (cancelled) return

        const { business } = await finishAuth(authRes.data, slug)
        if (cancelled) return

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
