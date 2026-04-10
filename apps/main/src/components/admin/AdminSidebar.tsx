'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, List, Settings, MessageSquare, BarChart, Home } from 'lucide-react'
import { cn } from '@doska/shared'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Companies', href: '/admin/companies', icon: BarChart }, // Использовал существующий импорт BarChart для Companies
    { name: 'Chats', href: '/admin/chats', icon: MessageSquare },
    { name: 'Trips', href: '/admin/trips', icon: List }, // Можно заменить иконки позже, если нужно
    { name: 'Vehicles', href: '/admin/vehicles', icon: Settings },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="fixed left-0 top-0 flex flex-col w-64 bg-gray-900 dark:bg-gray-950 text-white h-screen border-r dark:border-gray-800 overflow-y-auto z-50">
            <div className="flex items-center justify-center h-16 border-b border-gray-800 dark:border-gray-800">
                <span className="text-xl font-bold">Admin Panel</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center px-4 py-2 text-sm font-medium rounded-md group transition-colors",
                                isActive
                                    ? "bg-gray-800 dark:bg-gray-800 text-white"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-gray-800">
                <Link
                    href="/"
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
                >
                    <Home className="mr-3 h-6 w-6" />
                    Back to Site
                </Link>
            </div>
        </div>
    )
}
