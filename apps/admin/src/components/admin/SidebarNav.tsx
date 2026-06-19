'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Activity,
    AlertTriangle,
    BarChart,
    Bell,
    CalendarCheck,
    Car,
    LayoutDashboard,
    LineChart,
    List,
    MapPin,
    Megaphone,
    MessageSquare,
    Radio,
    Settings as SettingsIcon,
    Timer,
    Users,
} from 'lucide-react'
import { cn } from '@doska/shared'

type NavItem = { name: string; href: string; icon: typeof LayoutDashboard }
type NavSection = { label?: string; items: NavItem[] }

const sections: NavSection[] = [
    {
        items: [
            { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        ],
    },
    {
        label: 'Ops',
        items: [
            { name: 'Celery', href: '/admin/celery', icon: Timer },
        ],
    },
    {
        label: 'Common',
        items: [
            { name: 'Users', href: '/admin/users', icon: Users },
            { name: 'Companies', href: '/admin/companies', icon: BarChart },
            { name: 'Regions', href: '/admin/regions', icon: MapPin },
            { name: 'Notifications', href: '/admin/notifications', icon: Bell },
            { name: 'Ads', href: '/admin/ads', icon: Megaphone },
        ],
    },
    {
        label: 'Analytics',
        items: [
            { name: 'Обзор', href: '/admin/analytics/overview', icon: LineChart },
            { name: 'BulBul Go', href: '/admin/analytics/bulbulgo', icon: LineChart },
            { name: 'Версии', href: '/admin/analytics/versions', icon: LineChart },
            { name: 'Ошибки', href: '/admin/analytics/errors', icon: AlertTriangle },
            { name: 'События', href: '/admin/analytics/events', icon: Activity },
        ],
    },
    {
        label: 'BulBul Go',
        items: [
            { name: 'Trips', href: '/admin/trips', icon: List },
            { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
            { name: 'Chats', href: '/admin/chats', icon: MessageSquare },
            { name: 'Версии приложения', href: '/admin/settings/app', icon: SettingsIcon },
            { name: 'Фичи', href: '/admin/settings/features', icon: SettingsIcon },
            { name: 'Лимиты номеров', href: '/admin/settings/contact-limits', icon: SettingsIcon },
        ],
    },
    {
        label: 'Booking',
        items: [
            { name: 'Bots', href: '/admin/booking/bots', icon: CalendarCheck },
        ],
    },
    {
        label: 'Парсер',
        items: [
            { name: 'Настройки', href: '/admin/parser/settings', icon: SettingsIcon },
            { name: 'Каналы', href: '/admin/parser/channels', icon: Radio },
        ],
    },
]

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname()

    const isActive = (href: string) =>
        href === '/admin'
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`)

    return (
        <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-4 space-y-4">
            {sections.map((section, idx) => (
                <div key={section.label ?? idx} className="space-y-1">
                    {section.label && (
                        <div className="px-4 pb-1 text-[10px] uppercase tracking-wider text-gray-500">
                            {section.label}
                        </div>
                    )}
                    {section.items.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                'flex items-center px-4 py-2 text-sm font-medium rounded-md group transition-colors',
                                isActive(item.href)
                                    ? 'bg-gray-800 dark:bg-gray-800 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                            )}
                        >
                            <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                            {item.name}
                        </Link>
                    ))}
                </div>
            ))}
        </nav>
    )
}
