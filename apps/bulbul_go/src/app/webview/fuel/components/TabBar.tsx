'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Нижние табы сервиса: Лента · Карта · Мои метки. Живёт в layout сегмента,
// активный таб — по pathname, подсветка оптимистично по тапу. Переключение —
// SPA-заменой (один нативный экран, история не растёт).

type TabKey = 'feed' | 'map' | 'my'

const BASE = '/webview/fuel'

const TABS: { key: TabKey; path: string; label: string; icon: React.ReactNode }[] = [
    {
        key: 'feed',
        path: BASE,
        label: 'Лента',
        icon: (
            <>
                <rect x="2.2" y="2.6" width="11.6" height="3.4" rx="1.2" />
                <rect x="2.2" y="7.6" width="11.6" height="3.4" rx="1.2" opacity="0.55" />
                <path d="M2.2 13.6h7" opacity="0.4" />
            </>
        ),
    },
    {
        key: 'map',
        path: `${BASE}/map`,
        label: 'Карта',
        icon: (
            <>
                <path d="m2.4 4.2 3.6-1.6 4 1.6 3.6-1.6v9.2l-3.6 1.6-4-1.6-3.6 1.6Z" />
                <path d="M6 2.8v9.2M10 4.4v9.2" opacity="0.5" />
            </>
        ),
    },
    {
        key: 'my',
        path: `${BASE}/my`,
        label: 'Мои метки',
        icon: (
            <>
                <path d="M8 14s-4.6-4-4.6-7.4a4.6 4.6 0 0 1 9.2 0C12.6 10 8 14 8 14Z" />
                <circle cx="8" cy="6.4" r="1.6" />
            </>
        ),
    },
]

export function TabBar() {
    const router = useRouter()
    const pathname = usePathname()

    const [pending, setPending] = useState<TabKey | null>(null)
    useEffect(() => setPending(null), [pathname])

    useEffect(() => {
        for (const t of TABS) router.prefetch(t.path)
    }, [router])

    const isTabRoute = TABS.some((t) => t.path === pathname)
    if (!isTabRoute) return null

    const active = pending ?? TABS.find((t) => t.path === pathname)?.key ?? 'feed'

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur">
            {/* +26px к safe-area: во вьюве приложения inset может быть 0,
                с меньшим запасом кнопки липнут к жестовой зоне */}
            <div className="flex items-stretch px-2 pb-[calc(env(safe-area-inset-bottom)+26px)]">
                {TABS.map((t) => {
                    const isActive = t.key === active
                    return (
                        <button
                            key={t.key}
                            onClick={() => {
                                if (isActive) return
                                setPending(t.key)
                                router.replace(t.path)
                            }}
                            className="flex flex-1 flex-col items-center gap-0.5 py-1.5"
                            style={
                                isActive
                                    ? { color: 'var(--wv-accent)' }
                                    : { opacity: 0.55 }
                            }
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 16 16"
                                fill="none"
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
                })}
            </div>
        </nav>
    )
}
