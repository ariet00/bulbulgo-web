'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { staffApi } from '@/apis/staff'
import {
  api,
  loadAccessToken,
  setAccessToken,
  setBotSlug,
} from '@/lib/api'
import { getTelegramInit } from '@/lib/telegram'

const FALLBACK_BOT_SLUG = process.env.NEXT_PUBLIC_BOT_SLUG || ''

type AuthStatus = 'idle' | 'authenticating' | 'ready' | 'error'

export default function CheckinPage() {
  const t = useTranslations('checkin')
  const params = useParams<{ token: string }>()
  const searchParams = useSearchParams()
  const token = params.token

  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle')
  const [authError, setAuthError] = useState<string | null>(null)

  const workplaceQuery = useQuery({
    queryKey: ['workplace-public', token],
    queryFn: () => staffApi.getWorkplaceByToken(token),
    enabled: Boolean(token),
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setAuthStatus('authenticating')
      const existing = loadAccessToken()
      if (existing) {
        setAuthStatus('ready')
        return
      }

      const tg = await getTelegramInit()
      if (cancelled) return
      if (!tg || !tg.initData) {
        setAuthError(t('openInTelegram'))
        setAuthStatus('error')
        return
      }
      const urlSlug = searchParams.get('bot')
      const slug = urlSlug || tg.startParam || FALLBACK_BOT_SLUG
      if (!slug) {
        setAuthError(t('botMissing'))
        setAuthStatus('error')
        return
      }

      try {
        const res = await api.post(`/api/v1/bot/${slug}/auth`, {
          init_data: tg.initData,
        })
        if (cancelled) return
        setAccessToken(res.data.access_token)
        setBotSlug(res.data.bot?.slug ?? slug)
        setAuthStatus('ready')
      } catch (err: any) {
        if (cancelled) return
        setAuthError(err?.response?.data?.message ?? err?.message ?? 'Auth error')
        setAuthStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const checkinMutation = useMutation({
    mutationFn: () => staffApi.checkinByToken(token),
  })

  if (workplaceQuery.isLoading) {
    return <CheckinShell>{t('loading')}</CheckinShell>
  }
  if (workplaceQuery.error || !workplaceQuery.data) {
    return <CheckinShell>{t('qrInvalid')}</CheckinShell>
  }

  const wp = workplaceQuery.data
  return (
    <CheckinShell>
      <h1 className="text-xl font-semibold">{wp.company_name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{wp.name}</p>
      {wp.address && (
        <p className="mt-0.5 text-xs text-muted-foreground">{wp.address}</p>
      )}

      <div className="mt-8 w-full">
        {authStatus === 'authenticating' && (
          <p className="text-sm text-center">{t('authenticating')}</p>
        )}
        {authStatus === 'error' && (
          <p className="text-sm text-center text-red-600">{authError}</p>
        )}
        {authStatus === 'ready' && (
          <div className="flex flex-col items-center gap-3">
            {checkinMutation.isPending && (
              <p className="text-sm">{t('processing')}</p>
            )}
            {checkinMutation.data && (
              <ResultCard result={checkinMutation.data} />
            )}
            {checkinMutation.error && (
              <p className="text-sm text-red-600 text-center">
                {(checkinMutation.error as any)?.response?.data?.message ??
                  (checkinMutation.error as any)?.message ??
                  t('error')}
              </p>
            )}
            {!checkinMutation.data && (
              <button
                type="button"
                disabled={checkinMutation.isPending}
                onClick={() => checkinMutation.mutate()}
                className="w-full rounded-md bg-blue-600 px-4 py-3 text-base font-medium text-white disabled:opacity-60"
              >
                {t('scanButton')}
              </button>
            )}
          </div>
        )}
      </div>
    </CheckinShell>
  )
}

function CheckinShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-6 text-center">
      {children}
    </main>
  )
}

function ResultCard({
  result,
}: {
  result: {
    action: 'check_in' | 'check_out'
    check_in_at: string | null
    check_out_at: string | null
    total_minutes: number
    overtime_minutes: number
  }
}) {
  const t = useTranslations('checkin')
  const hhmm = (iso: string | null) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
  const fmt = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`

  return (
    <div className="w-full rounded-lg border bg-card p-4 text-left">
      <p className="text-base font-semibold">
        {result.action === 'check_in' ? t('checkedIn') : t('checkedOut')}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <span className="text-muted-foreground">{t('arrival')}</span>
        <span className="text-right">{hhmm(result.check_in_at)}</span>
        {result.action === 'check_out' && (
          <>
            <span className="text-muted-foreground">{t('departure')}</span>
            <span className="text-right">{hhmm(result.check_out_at)}</span>
            <span className="text-muted-foreground">{t('total')}</span>
            <span className="text-right">{fmt(result.total_minutes)}</span>
            {result.overtime_minutes > 0 && (
              <>
                <span className="text-muted-foreground">{t('overtime')}</span>
                <span className="text-right">{fmt(result.overtime_minutes)}</span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
