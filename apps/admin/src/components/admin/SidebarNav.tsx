'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Activity,
    AlertTriangle,
    BarChart,
    Bell,
    BellRing,
    CalendarCheck,
    Car,
    Database,
    ClipboardList,
    Flag,
    FolderTree,
    Fuel,
    Gift,
    LayoutDashboard,
    LayoutGrid,
    LineChart,
    List,
    MapPin,
    Megaphone,
    MessageSquare,
    Newspaper,
    Radio,
    Settings as SettingsIcon,
    Smartphone,
    Tags,
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
            { name: 'Сидеры', href: '/admin/seeders', icon: Database },
        ],
    },
    {
        label: 'Common',
        items: [
            { name: 'Users', href: '/admin/users', icon: Users },
            { name: 'Устройства', href: '/admin/devices', icon: Smartphone },
            { name: 'Companies', href: '/admin/companies', icon: BarChart },
            { name: 'Regions', href: '/admin/regions', icon: MapPin },
            { name: 'Notifications', href: '/admin/notifications', icon: Bell },
            { name: 'Ads', href: '/admin/ads', icon: Megaphone },
            { name: 'Сервисы', href: '/admin/services', icon: LayoutGrid },
            { name: 'Жалобы', href: '/admin/complaints', icon: Flag },
        ],
    },
    {
        label: 'Маркетплейс',
        items: [
            { name: 'Категории', href: '/admin/marketplace/categories', icon: FolderTree },
            { name: 'Атрибуты', href: '/admin/marketplace/attributes', icon: Tags },
            { name: 'Объявления', href: '/admin/marketplace/listings', icon: ClipboardList },
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
            { name: 'Отчёты', href: '/admin/reports', icon: ClipboardList },
        ],
    },
    {
        label: 'BulBul Go',
        items: [
            { name: 'Trips', href: '/admin/trips', icon: List },
            { name: 'Подписки', href: '/admin/subscriptions', icon: BellRing },
            { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
            { name: 'Chats', href: '/admin/chats', icon: MessageSquare },
            { name: 'Новости', href: '/admin/news', icon: Newspaper },
            { name: 'Рефералы', href: '/admin/referral', icon: Gift },
            { name: 'Настройки', href: '/admin/settings', icon: SettingsIcon },
        ],
    },
    {
        label: 'Где заправка',
        items: [
            { name: 'Метки топлива', href: '/admin/fuel/reports', icon: Fuel },
            { name: 'АЗС', href: '/admin/fuel/stations', icon: MapPin },
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
