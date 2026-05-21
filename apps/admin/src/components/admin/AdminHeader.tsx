'use client'

import { ThemeToggle } from '@/components/ThemeToggle'

export function AdminHeader() {
    return (
        <header className="bg-white dark:bg-gray-900 shadow h-16 flex items-center justify-between px-6 border-b dark:border-gray-800">
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Welcome, Admin
            </div>
            <div className="flex items-center space-x-4">
                <ThemeToggle />
                {/* User Profile / Logout - can add later */}
            </div>
        </header>
    )
}
