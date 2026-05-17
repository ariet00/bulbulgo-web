'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { toast } from 'sonner'

import { api, loadAccessToken, loadBotSlug, setAccessToken, setBotSlug } from '@/lib/api'
import { bookingApi } from '@/apis/booking'
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

      const urlSlug = searchParams.get('bot')

      // Fast path: reuse existing session if a token is already stored.
      const existingToken = loadAccessToken()
      const cachedSlug = urlSlug || loadBotSlug() || FALLBACK_BOT_SLUG
      if (existingToken && cachedSlug) {
        setBotSlug(cachedSlug)
        try {
          const biz = await api.get('/api/v1/booking/business')
          if (cancelled) return
          const business = {
            company: biz.data.company,
            is_owner: biz.data.is_owner,
            is_staff: biz.data.is_staff ?? false,
            settings: biz.data.settings ?? null,
          }
          setBusiness(business)
          setBootStatus('ready')
          if (business.is_owner || business.is_staff) router.replace('/owner')
          else router.replace('/book')
          return
        } catch (err: any) {
          if (cancelled) return
          if (err?.response?.status === 401) {
            setAccessToken(null)
            // Token expired/invalid — fall through to full auth below.
          } else {
            setError(err?.response?.data?.message ?? err?.message ?? 'Unknown error')
            setBootStatus('error')
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

        let { business } = await finishAuth(authRes.data, slug)
        if (cancelled) return

        const inviteToken = searchParams.get('invite')
        if (inviteToken) {
          try {
            await bookingApi.acceptInvite(inviteToken)
            toast.success('Вы добавлены в команду')
            // Re-fetch business to reflect new staff role.
            const biz = await api.get('/api/v1/booking/business')
            business = {
              company: biz.data.company,
              is_owner: biz.data.is_owner,
              is_staff: biz.data.is_staff,
              settings: biz.data.settings ?? null,
            }
          } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Не удалось принять приглашение')
          }
        }

        setBusiness(business)
        setBootStatus('ready')
        if (business.is_owner) router.replace('/owner')
        else if (business.is_staff) router.replace('/owner')
        else router.replace('/book')
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
