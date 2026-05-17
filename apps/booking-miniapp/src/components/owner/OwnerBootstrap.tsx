'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { api, loadAccessToken, loadBotSlug, setAccessToken, setBotSlug } from '@/lib/api'
import { useBookingStore } from '@/store/useBookingStore'

const FALLBACK_BOT_SLUG = process.env.NEXT_PUBLIC_BOT_SLUG || ''

/**
 * Repopulates the booking store on direct page loads / reloads of /owner/*
 * routes. The full auth flow lives in <MiniAppBootstrap> on the root page,
 * but it does not run when the user lands on a deep link or refreshes a
 * sub-page. Without this, the store is empty and the nav filters hide
 * every owner-only tab.
 */
export function OwnerBootstrap() {
  const router = useRouter()
  const { business, setBusiness } = useBookingStore()

  useEffect(() => {
    if (business) return

    const token = loadAccessToken()
    const slug = loadBotSlug() || FALLBACK_BOT_SLUG
    if (!token || !slug) {
      router.replace('/')
      return
    }

    setBotSlug(slug)
    let cancelled = false
    ;(async () => {
      try {
        const biz = await api.get('/api/v1/booking/business')
        if (cancelled) return
        setBusiness({
          company: biz.data.company,
          is_owner: biz.data.is_owner,
          is_staff: biz.data.is_staff ?? false,
          settings: biz.data.settings ?? null,
        })
      } catch (err: any) {
        if (cancelled) return
        if (err?.response?.status === 401) {
          setAccessToken(null)
          router.replace('/')
        }
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
