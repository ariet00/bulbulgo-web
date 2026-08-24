'use client'

// Табы авторынка: Поиск · Мои · [Создать] · Избранные · Профиль.
// Каркас — общий TabBar; «Создать» — центральное действие, открывает wizard
// нативным экраном поверх (openWebPage).

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TabBar as SharedTabBar, type TabItem } from '../../components/TabBar'
import { navigateTo } from '../lib/nav'

const BASE = '/webview/auto'

const TABS: TabItem[] = [
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
        fillWhenActive: true,
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

export function TabBar() {
    const router = useRouter()
    // wizard — не таб (общий TabBar его не префетчит), но открывается с
    // центральной кнопки — греем заранее, чтобы тап не ждал чанк
    useEffect(() => {
        router.prefetch(`${BASE}/new`)
    }, [router])
    return (
        <SharedTabBar
            items={TABS}
            centerAction={{
                label: 'Создать',
                ariaLabel: 'Создать объявление',
                onPress: () =>
                    navigateTo(router, `${BASE}/new`, 'Подать объявление'),
            }}
        />
    )
}
