'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { navigateTo } from '../lib/nav'

// Нижние табы сервиса: Поиск · Мои · Создать · Избранные · Профиль.
// Табы переключаются SPA-заменой (один нативный экран, история не растёт);
// «Создать» — не таб, а действие: открывает wizard нативным экраном поверх.

export type TabKey = 'search' | 'my' | 'favorites' | 'profile'

const BASE = '/webview/auto_market'

const TABS: { key: TabKey; path: string; label: string; icon: React.ReactNode }[] = [
    {
        key: 'search',
        path: BASE,
        label: 'Поиск',
        icon: (
            <>
                <circle cx="7" cy="7" r="4.6" />
                <path d="m10.6 10.6 3.4 3.4" />
            </>
        ),
    },
    {
        key: 'my',
        path: `${BASE}/my`,
        label: 'Мои',
        icon: (
            <>
                <rect x="2.2" y="3.2" width="11.6" height="9.6" rx="1.6" />
                <path d="M4.8 6.2h6.4M4.8 8.6h4" />
            </>
        ),
    },
    {
        key: 'favorites',
        path: `${BASE}/favorites`,
        label: 'Избранные',
        icon: (
            <path d="M8 13.2C5.2 11.2 2.3 8.9 2.3 6.1a3.1 3.1 0 0 1 5.7-1.8A3.1 3.1 0 0 1 13.7 6c0 2.9-2.9 5.2-5.7 7.2Z" />
        ),
    },
    {
        key: 'profile',
        path: `${BASE}/profile`,
        label: 'Профиль',
        icon: (
            <>
                <circle cx="8" cy="5.4" r="2.6" />
                <path d="M2.8 13.4a5.4 5.4 0 0 1 10.4 0" />
            </>
        ),
    },
]

export function TabBar({ active }: { active: TabKey }) {
    const router = useRouter()
    const [left, right] = [TABS.slice(0, 2), TABS.slice(2)]

    // кнопки (в отличие от Link) не префетчат роуты — без этого тап по табу
    // ждёт загрузку чанка/RSC целевой страницы и переход ощущается с задержкой
    useEffect(() => {
        for (const t of TABS) router.prefetch(t.path)
        router.prefetch(`${BASE}/new`)
    }, [router])

    const tab = (t: (typeof TABS)[number]) => {
        const isActive = t.key === active
        return (
            <button
                key={t.key}
                onClick={() => !isActive && router.replace(t.path)}
                className="flex flex-1 flex-col items-center gap-0.5 py-1.5"
                style={isActive ? { color: 'var(--am-accent)' } : { opacity: 0.55 }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill={t.key === 'favorites' && isActive ? 'currentColor' : 'none'}
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

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur">
            {/* +10px к safe-area: во вьюве приложения inset может быть 0,
                без запаса кнопки прилипают к нижней кромке/жестовой зоне */}
            <div className="flex items-stretch px-2 pb-[calc(env(safe-area-inset-bottom)+10px)]">
                {left.map(tab)}

                {/* Создать — акцентная центральная кнопка, открывает wizard */}
                <button
                    onClick={() =>
                        navigateTo(
                            router,
                            `${BASE}/new`,
                            'Подать объявление',
                        )
                    }
                    aria-label="Создать объявление"
                    className="flex flex-1 flex-col items-center gap-0.5 py-1.5"
                >
                    <span
                        className="flex h-9 w-9 -translate-y-2.5 items-center justify-center rounded-full text-white shadow-lg"
                        style={{ background: 'var(--am-accent)' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                            <path d="M8 3v10M3 8h10" />
                        </svg>
                    </span>
                    <span className="-mt-2 text-[10px] font-medium" style={{ color: 'var(--am-accent)' }}>
                        Создать
                    </span>
                </button>

                {right.map(tab)}
            </div>
        </nav>
    )
}
