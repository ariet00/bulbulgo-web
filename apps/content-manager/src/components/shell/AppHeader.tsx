'use client'

import { cn } from '@doska/shared'
import { Link, usePathname } from '@doska/i18n'

import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { Wordmark } from './Wordmark'

const NAV = [{ href: '/', label: 'Аккаунты' }] as const

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Wordmark />

        <nav className="flex items-center gap-1 text-sm" aria-label="Разделы">
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' || /^\/\d+/.test(pathname) : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-md px-2.5 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'bg-secondary font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
