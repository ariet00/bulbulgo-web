'use client'

// Табы «Где Бензин»: Лента · Карта · Мои метки. Каркас — общий TabBar.

import { TabBar as SharedTabBar, type TabItem } from '../../components/TabBar'

const BASE = '/webview/fuel'

const TABS: TabItem[] = [
    {
        key: 'feed',
        path: BASE,
        label: 'Лента',
        icon: 'list',
    },
    {
        key: 'map',
        path: `${BASE}/map`,
        label: 'Карта',
        icon: 'map',
    },
    {
        key: 'my',
        path: `${BASE}/my`,
        label: 'Профиль',
        icon: 'user',
    },
]

export function TabBar() {
    return <SharedTabBar items={TABS} />
}
