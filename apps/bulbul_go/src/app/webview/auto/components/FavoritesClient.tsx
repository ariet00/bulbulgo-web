'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { ensureAuth, initWebviewAuth } from '../../auth'
import { removeFavorite } from '../lib/api'
import { pickLabel } from '../lib/format'
import { navigateTo } from '../lib/nav'
import {
    qk,
    useCatalog,
    useCategoryAttributes,
    useFavorites,
    useRates,
} from '../lib/queries'
import type { ListingPage } from '../lib/types'
import { ListingCard } from './ListingCard'

// «Избранное»: сохранённые объявления карточками ленты + снятие с избранного.
// Данные — React Query (общий кэш справочников, SWR списка).

export function FavoritesClient() {
    const router = useRouter()
    const qc = useQueryClient()
    const [authed, setAuthed] = useState<boolean | null>(null)

    useEffect(() => {
        let alive = true
        ;(async () => {
            await initWebviewAuth()
            const ok = await ensureAuth()
            if (alive) setAuthed(ok)
        })()
        return () => {
            alive = false
        }
    }, [])

    const favQ = useFavorites(authed === true)
    const items = favQ.data?.items ?? []
    const loading = authed === null || favQ.isLoading

    const { data: tree } = useCatalog()
    const carsId = useMemo(() => {
        const auto = tree?.find((c) => c.slug === 'auto')
        return auto?.children.find((c) => c.slug === 'cars')?.id ?? null
    }, [tree])
    const { data: attrs = [] } = useCategoryAttributes(carsId)
    const { data: rates = {} } = useRates()

    const optionLabel = useMemo(() => {
        const map: Record<string, Record<string, string>> = {}
        for (const a of attrs) {
            map[a.key] = Object.fromEntries(
                a.options.map((o) => [o.value, pickLabel(o.label)]),
            )
        }
        return (key: string, value: string) => map[key]?.[value] ?? value
    }, [attrs])

    const unfavorite = useCallback(
        async (id: number) => {
            // оптимистично убираем из кэша; при ошибке рефетч вернёт
            qc.setQueryData<ListingPage>(qk.favorites, (page) =>
                page
                    ? {
                          total: page.total - 1,
                          items: page.items.filter((l) => l.id !== id),
                      }
                    : page,
            )
            try {
                await removeFavorite(id)
            } catch {
                void qc.invalidateQueries({ queryKey: qk.favorites })
            }
        },
        [qc],
    )

    if (authed === false) {
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
                <p className="text-[17px] font-semibold">Нужен вход</p>
                <p className="mt-2 text-[14px] text-muted-foreground">
                    Войдите, чтобы увидеть избранные объявления.
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

    return (
        <div className="min-h-dvh px-4 pb-28 pt-4">
            <h1 className="text-[20px] font-bold tracking-tight">Избранное</h1>

            <div className="mt-4 space-y-3">
                {loading || authed === null ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="am-skeleton h-40 rounded-2xl" />
                    ))
                ) : items.length === 0 ? (
                    <p className="py-16 text-center text-[14px] text-muted-foreground">
                        Пока ничего не сохранили — жмите сердечко в объявлении.
                    </p>
                ) : (
                    items.map((l) => (
                        <div key={l.id} className="relative">
                            <ListingCard
                                listing={l}
                                rates={rates}
                                optionLabel={optionLabel}
                                onOpen={(x) =>
                                    navigateTo(
                                        router,
                                        `/webview/auto/${x.id}`,
                                        typeof x.title === 'string' ? x.title : undefined,
                                    )
                                }
                            />
                            <button
                                onClick={() => unfavorite(l.id)}
                                aria-label="Убрать из избранного"
                                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                                    <path d="M8 13.6C5 11.4 1.8 8.9 1.8 5.9a3.4 3.4 0 0 1 6.2-2 3.4 3.4 0 0 1 6.2 2c0 3-3.2 5.5-6.2 7.7Z" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
