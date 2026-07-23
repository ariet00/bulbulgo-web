'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ensureAuth, initWebviewAuth } from '../../auth'
import * as bridge from '../../bridge'
import { renewListing, updateListing } from '../lib/api'
import { formatPrice, pickLabel, timeAgo } from '../lib/format'
import { navigateTo } from '../lib/nav'
import { useListingInvalidation, useMyListings } from '../lib/queries'
import type { Listing } from '../lib/types'

// «Мои объявления»: вкладки по статусу + быстрые действия (снять/вернуть/
// продано). Редактирование полей — v2; статусные переходы покрывают основной
// жизненный цикл объявления.

const TABS = [
    ['active', 'Активные'],
    ['archived', 'Снятые'],
    ['sold', 'Проданные'],
] as const

type Status = (typeof TABS)[number][0]

export function MyListingsClient() {
    const router = useRouter()
    const [authed, setAuthed] = useState<boolean | null>(null)
    const [status, setStatus] = useState<Status>('active')
    const [busyId, setBusyId] = useState<number | null>(null)
    const invalidate = useListingInvalidation()

    useEffect(() => {
        ;(async () => {
            await initWebviewAuth()
            setAuthed(await ensureAuth())
        })()
    }, [])

    const mineQ = useMyListings(status, authed === true)
    const items = mineQ.data?.items ?? []
    const loading = authed === null || mineQ.isLoading

    const setListingStatus = async (l: Listing, next: string) => {
        setBusyId(l.id)
        try {
            const updated = await updateListing(l.id, { status: next })
            invalidate(updated)
            bridge.haptic?.('light').catch(() => {})
        } catch {
            bridge.toast?.('Не получилось, попробуйте ещё раз', 'warning').catch(() => {})
        } finally {
            setBusyId(null)
        }
    }

    // продление: новый срок (+ возврат в публикацию для снятых по сроку)
    const renew = async (l: Listing) => {
        setBusyId(l.id)
        try {
            invalidate(await renewListing(l.id))
            bridge.toast?.('Срок продлён', 'success').catch(() => {})
        } catch {
            bridge.toast?.('Не получилось, попробуйте ещё раз', 'warning').catch(() => {})
        } finally {
            setBusyId(null)
        }
    }

    const expiryLabel = (l: Listing): string | null => {
        if (!l.expire_at) return null
        const days = Math.ceil(
            (new Date(l.expire_at).getTime() - Date.now()) / 86_400_000,
        )
        if (days <= 0) return 'срок истёк'
        if (days <= 5) return `истекает через ${days} дн.`
        return `до ${new Date(l.expire_at).toLocaleDateString('ru-RU')}`
    }

    if (authed === false) {
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
                <p className="text-[17px] font-semibold">Нужен вход</p>
                <p className="mt-2 text-[14px] text-muted-foreground">
                    Войдите, чтобы увидеть свои объявления.
                </p>
                <button
                    onClick={async () => setAuthed(await ensureAuth())}
                    className="mt-6 rounded-xl px-6 py-3 text-[15px] font-semibold text-white"
                    style={{ background: 'var(--am-accent)' }}
                >
                    Войти
                </button>
            </div>
        )
    }

    const actionBtn =
        'rounded-lg border px-3 py-1.5 text-[12px] font-medium active:bg-muted disabled:opacity-50'

    return (
        <div className="min-h-dvh px-4 pb-28 pt-4">
            <h1 className="text-[20px] font-bold tracking-tight">
                Мои объявления
            </h1>

            <div className="mt-3 flex rounded-xl bg-muted/60 p-1 text-[13px] font-semibold">
                {TABS.map(([value, label]) => (
                    <button
                        key={value}
                        onClick={() => setStatus(value)}
                        className="flex-1 rounded-[10px] py-1.5 transition-colors"
                        style={
                            status === value
                                ? { background: 'var(--am-accent)', color: '#fff' }
                                : { opacity: 0.7 }
                        }
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="mt-4 space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="am-skeleton h-24 rounded-2xl" />
                    ))
                ) : items.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-[15px] font-semibold">Здесь пусто</p>
                        {status === 'active' && (
                            <button
                                onClick={() =>
                                    navigateTo(
                                        router,
                                        '/webview/auto/new',
                                        'Подать объявление',
                                    )
                                }
                                className="mt-4 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white"
                                style={{ background: 'var(--am-accent)' }}
                            >
                                Подать объявление
                            </button>
                        )}
                    </div>
                ) : (
                    items.map((l) => {
                        const cover = l.photos?.[0]
                        const title =
                            typeof l.title === 'string'
                                ? l.title
                                : pickLabel(l.title ?? undefined)
                        return (
                            <div
                                key={l.id}
                                className="overflow-hidden rounded-2xl border bg-card"
                            >
                                <button
                                    onClick={() =>
                                        navigateTo(
                                            router,
                                            `/webview/auto/my/${l.id}`,
                                            typeof l.title === 'string' ? l.title : undefined,
                                        )
                                    }
                                    className="flex w-full items-center gap-3 px-3 py-3 text-left"
                                >
                                    {cover ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={cover.thumb ?? cover.url}
                                            alt=""
                                            className="h-16 w-20 shrink-0 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] text-muted-foreground">
                                            {l.kind === 'want' ? 'Куплю' : 'Без фото'}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[14px] font-semibold">
                                            {title}
                                        </p>
                                        <p className="font-mono text-[13px] font-semibold">
                                            {l.kind === 'want' && l.price != null
                                                ? 'до '
                                                : ''}
                                            {formatPrice(l.price, l.currency_code)}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {timeAgo(l.created_at)}
                                            {status === 'active' &&
                                                expiryLabel(l) && (
                                                    <span> · {expiryLabel(l)}</span>
                                                )}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {l.views} просмотров ·{' '}
                                            {l.contacts} показов номера
                                        </p>
                                    </div>
                                </button>
                                <div className="flex gap-2 border-t px-3 py-2">
                                    {status === 'active' ? (
                                        <>
                                            <button
                                                disabled={busyId === l.id}
                                                onClick={() =>
                                                    setListingStatus(l, 'sold')
                                                }
                                                className={actionBtn}
                                                style={{
                                                    color: 'var(--am-accent)',
                                                    borderColor:
                                                        'var(--am-accent-border)',
                                                }}
                                            >
                                                Продано
                                            </button>
                                            <button
                                                disabled={busyId === l.id}
                                                onClick={() => renew(l)}
                                                className={actionBtn}
                                            >
                                                Продлить
                                            </button>
                                            <button
                                                disabled={busyId === l.id}
                                                onClick={() =>
                                                    setListingStatus(l, 'archived')
                                                }
                                                className={actionBtn}
                                            >
                                                Снять
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            disabled={busyId === l.id}
                                            onClick={() => renew(l)}
                                            className={actionBtn}
                                        >
                                            Опубликовать снова
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
