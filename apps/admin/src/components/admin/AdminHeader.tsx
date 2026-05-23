'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button, Sheet, SheetContent, SheetTitle, SheetTrigger } from '@doska/ui'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SidebarNav } from './SidebarNav'

export function AdminHeader() {
    const [open, setOpen] = useState(false)

    return (
        <header className="bg-white dark:bg-gray-900 shadow h-16 flex items-center justify-between gap-2 px-3 sm:px-6 border-b dark:border-gray-800">
            <div className="flex items-center gap-2 min-w-0">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden -ml-1"
                            aria-label="Открыть меню"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="w-64 p-0 bg-gray-900 dark:bg-gray-950 text-white border-r border-gray-800"
                    >
                        <SheetTitle className="flex items-center justify-center h-16 border-b border-gray-800 text-white text-xl">
                            Admin Panel
                        </SheetTitle>
                        <SidebarNav onNavigate={() => setOpen(false)} />
                    </SheetContent>
                </Sheet>
                <div className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 truncate">
                    Welcome, Admin
                </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
                <ThemeToggle />
                {/* User Profile / Logout - can add later */}
            </div>
        </header>
    )
}
