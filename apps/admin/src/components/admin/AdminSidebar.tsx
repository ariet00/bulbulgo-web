'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BarChart,
    Bell,
    CalendarCheck,
    Car,
    LayoutDashboard,
    List,
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
            { name: 'Notifications', href: '/admin/notifications', icon: Bell },
        ],
    },
    {
        label: 'Rideshare',
        items: [
            { name: 'Trips', href: '/admin/trips', icon: List },
            { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
            { name: 'Chats', href: '/admin/chats', icon: MessageSquare },
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

export function AdminSidebar() {
    const pathname = usePathname()

    const isActive = (href: string) =>
        href === '/admin'
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`)

    return (
        <div className="fixed left-0 top-0 flex flex-col w-64 bg-gray-900 dark:bg-gray-950 text-white h-screen border-r dark:border-gray-800 overflow-y-auto z-50">
            <div className="flex items-center justify-center h-16 border-b border-gray-800 dark:border-gray-800">
                <span className="text-xl font-bold">Admin Panel</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-4">
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
        </div>
    )
}
