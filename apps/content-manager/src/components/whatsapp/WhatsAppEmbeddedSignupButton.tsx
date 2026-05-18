'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@doska/ui'
import {
  useOnboardWhatsApp,
  useWhatsAppConfig,
  type WhatsAppOnboardingBody,
} from '@doska/shared'
import { Loader2 } from 'lucide-react'

interface Props {
  onConnected?: (accountId: number) => void
}

interface FBWindow {
  FB?: {
    init: (params: any) => void
    login: (cb: (resp: any) => void, opts: any) => void
  }
  fbAsyncInit?: () => void
}

let sdkPromise: Promise<void> | null = null

function loadFacebookSdk(appId: string, version: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject('no window')
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise<void>((resolve) => {
    const w = window as unknown as FBWindow
    if (w.FB) {
      resolve()
      return
    }
    w.fbAsyncInit = () => {
      w.FB!.init({
        appId,
        cookie: true,
        xfbml: false,
        version,
      })
      resolve()
    }
    const existing = document.getElementById('facebook-jssdk')
    if (existing) {
      // Script already on page; wait for init or resolve if FB present.
      const poll = setInterval(() => {
        if ((window as unknown as FBWindow).FB) {
          clearInterval(poll)
          resolve()
        }
      }, 100)
      return
    }
    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })
  return sdkPromise
}

export function WhatsAppEmbeddedSignupButton({ onConnected }: Props) {
  const { data: config, isLoading } = useWhatsAppConfig()
  const onboard = useOnboardWhatsApp()
  const [sdkReady, setSdkReady] = useState(false)
  const [launching, setLaunching] = useState(false)
  const sessionInfoRef = useRef<{ phone_number_id?: string; waba_id?: string }>(
    {},
  )

  useEffect(() => {
    if (!config?.app_id || !config?.config_id) return
    loadFacebookSdk(config.app_id, config.graph_api_version)
      .then(() => setSdkReady(true))
      .catch(() => setSdkReady(false))
  }, [config?.app_id, config?.config_id, config?.graph_api_version])

  // Meta posts a JSON message with phone_number_id + waba_id once the user
  // finishes the Embedded Signup steps. Capture it ahead of FB.login's
  // callback, which only delivers the OAuth code.
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (
        typeof event.origin !== 'string' ||
        !event.origin.endsWith('facebook.com')
      ) {
        return
      }
      let data: any
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
      } catch {
        return
      }
      if (data?.type !== 'WA_EMBEDDED_SIGNUP') return
      if (data.event === 'FINISH' && data.data) {
        sessionInfoRef.current = {
          phone_number_id: data.data.phone_number_id,
          waba_id: data.data.waba_id,
        }
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const handleClick = useCallback(() => {
    if (!config?.app_id || !config?.config_id) return
    const w = window as unknown as FBWindow
    if (!w.FB) return
    setLaunching(true)
    sessionInfoRef.current = {}
    w.FB.login(
      async (resp: any) => {
        setLaunching(false)
        const code = resp?.authResponse?.code
        const { phone_number_id, waba_id } = sessionInfoRef.current
        if (!code || !phone_number_id || !waba_id) {
          // User dismissed the dialog or Embedded Signup wasn't completed.
          return
        }
        const body: WhatsAppOnboardingBody = {
          code,
          phone_number_id,
          waba_id,
        }
        const account = await onboard.mutateAsync(body)
        onConnected?.(account.id)
      },
      {
        config_id: config.config_id,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          feature: 'whatsapp_embedded_signup',
          sessionInfoVersion: 3,
        },
      },
    )
  }, [config?.app_id, config?.config_id, onboard, onConnected])

  if (isLoading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Загрузка…
      </Button>
    )
  }
  if (!config?.configured) {
    return (
      <Button disabled className="w-full">
        Embedded Signup не настроен
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={!sdkReady || launching || onboard.isPending}
      className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white"
    >
      {(launching || onboard.isPending) && (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      )}
      Подключить WhatsApp Business
    </Button>
  )
}
