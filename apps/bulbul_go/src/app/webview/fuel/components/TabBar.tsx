'use client'

// Табы «Где Бензин»: Лента · Карта · Мои метки. Каркас — общий TabBar.

import { TabBar as SharedTabBar, type TabItem } from '../../components/TabBar'

const BASE = '/webview/fuel'

const TABS: TabItem[] = [
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
    return <SharedTabBar items={TABS} />
}
