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
        icon: 'search',
    },
    {
        key: 'my',
        path: `${BASE}/my`,
        label: 'Мои',
        icon: 'fileText',
    },
    {
        key: 'favorites',
        path: `${BASE}/favorites`,
        label: 'Избранные',
        icon: 'heart',
    },
    {
        key: 'profile',
        path: `${BASE}/profile`,
        label: 'Профиль',
        icon: 'user',
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
                ariaLabel: 'Создать объявление',
                onPress: () =>
                    navigateTo(router, `${BASE}/new`, 'Подать объявление'),
            }}
        />
    )
}
