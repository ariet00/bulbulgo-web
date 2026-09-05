'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Стандартный нижний таббар webview-сервисов. Сервис описывает только табы
// (и опционально центральное действие) — каркас общий: fixed-панель с blur,
// подсветка активного оптимистично по тапу (пока Next грузит страницу),
// префетч роутов, скрытие на глубоких экранах, переключение router.replace
// (один нативный экран, история не растёт). Живёт в layout сегмента — не
// перемонтируется при переходах.

export interface TabItem {
    key: string
    path: string
    label: string
    /** содержимое svg 16×16 (stroke=currentColor задаёт каркас) */
    icon: ReactNode
    /** заливать иконку при активности (сердечко «Избранных») */
    fillWhenActive?: boolean
}

export function TabBar({
    items,
    centerAction,
}: {
    items: TabItem[]
    /** акцентная приподнятая кнопка в центре («Создать» в авторынке) */
    centerAction?: { label: string; ariaLabel: string; onPress: () => void }
}) {
    const router = useRouter()
    const pathname = usePathname()

    const [pending, setPending] = useState<string | null>(null)
    useEffect(() => setPending(null), [pathname])

    useEffect(() => {
        for (const t of items) router.prefetch(t.path)
    }, [router, items])

    const isTabRoute = items.some((t) => t.path === pathname)
    if (!isTabRoute) return null

    const active =
        pending ?? items.find((t) => t.path === pathname)?.key ?? items[0]?.key

    const tab = (t: TabItem) => {
        const isActive = t.key === active
        return (
            <button
                key={t.key}
                onClick={() => {
                    if (isActive) return
                    setPending(t.key)
                    router.replace(t.path)
                }}
                // touch-manipulation: WebKit не придерживает первый тап в
                // ожидании двойного (зум) — срабатывание с первого касания
                className="flex flex-1 touch-manipulation flex-col items-center gap-0.5 pt-2 pb-[calc(env(safe-area-inset-bottom)+26px)]"
                style={
                    isActive ? { color: 'var(--wv-accent)' } : { opacity: 0.55 }
                }
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill={t.fillWhenActive && isActive ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                >
                    {t.icon}
                </svg>
                <span className="text-[10px] font-medium">{t.label}</span>
            </button>
        )
    }

    const mid = Math.ceil(items.length / 2)
    const [left, right] = centerAction
        ? [items.slice(0, mid), items.slice(mid)]
        : [items, []]

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur">
            {/* нижний запас (+26px к safe-area: во вьюве inset может быть 0)
                живёт ВНУТРИ кнопок, не на контейнере — иначе нижняя часть
                панели была бы мёртвой зоной и тапы «мимо иконки» терялись */}
            <div className="flex items-stretch px-2">
                {left.map(tab)}

                {centerAction && (
                    <button
                        onClick={centerAction.onPress}
                        aria-label={centerAction.ariaLabel}
                        className="flex flex-1 touch-manipulation flex-col items-center gap-0.5 pt-2 pb-[calc(env(safe-area-inset-bottom)+26px)]"
                    >
                        <span
                            className="flex h-9 w-9 -translate-y-2.5 items-center justify-center rounded-full text-white shadow-lg"
                            style={{ background: 'var(--wv-primary)' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                                <path d="M8 3v10M3 8h10" />
                            </svg>
                        </span>
                        <span
                            className="-mt-2 text-[10px] font-medium"
                            style={{ color: 'var(--wv-accent)' }}
                        >
                            {centerAction.label}
                        </span>
                    </button>
                )}

                {right.map(tab)}
            </div>
        </nav>
    )
}
