'use client'

import { useEffect } from 'react'

import { applyTelegramTheme, subscribeTelegramTheme } from '@/lib/telegram'

/**
 * Applies the host Telegram theme (light/dark + palette) to the Mini App on
 * mount and keeps it in sync when the user changes their Telegram theme.
 * Mounted once in the root layout so it covers every page.
 */
export function TelegramTheme() {
  useEffect(() => {
    applyTelegramTheme()
    let unsub = () => {}
    subscribeTelegramTheme(applyTelegramTheme).then(fn => {
      unsub = fn
    })
    return () => unsub()
  }, [])

  return null
}
