'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { LoginPrompt } from '../../components/LoginPrompt'
import { useWebviewAuth } from '../../useWebviewAuth'
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
import { Icon } from '../../components/icons'

// «Избранное»: сохранённые объявления карточками ленты + снятие с избранного.
// Данные — React Query (общий кэш справочников, SWR списка).

export function FavoritesClient() {
    const router = useRouter()
    const qc = useQueryClient()
    const { authed, login } = useWebviewAuth({ interactiveOnMount: true })

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
            <LoginPrompt
                variant="screen"
                text="Войдите, чтобы увидеть избранные объявления."
                onLogin={login}
            />
        )
    }

    return (
        <div className="min-h-dvh px-4 pb-28 pt-4">
            <h1 className="text-[20px] font-bold tracking-tight">Избранное</h1>

            <div className="mt-4 space-y-3">
                {loading || authed === null ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="wv-skeleton h-40 rounded-2xl" />
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
                                <Icon name="heartFilled" size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
