'use client'

import { SidebarNav } from './SidebarNav'

export function AdminSidebar() {
    return (
        <div className="hidden lg:flex fixed left-0 top-0 flex-col w-64 bg-gray-900 dark:bg-gray-950 text-white h-screen border-r dark:border-gray-800 z-40">
            <div className="flex items-center justify-center h-16 shrink-0 border-b border-gray-800 dark:border-gray-800">
                <span className="text-xl font-bold">Admin Panel</span>
            </div>
            <SidebarNav />
        </div>
    )
}
