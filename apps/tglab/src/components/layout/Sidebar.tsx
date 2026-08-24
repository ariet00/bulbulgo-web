'use client'

import { Link, usePathname } from '@/i18n/routing'
import { cn } from '@doska/shared'

import { NAV_ITEMS } from '@/lib/nav'
import { useAuthStore } from '@/store/useAuthStore'

export function Sidebar() {
  const pathname = usePathname()
  const permissions = useAuthStore((s) => s.user?.permissions ?? [])

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r bg-background">
      <div className="h-14 flex items-center px-5 border-b">
        <span className="font-semibold tracking-tight">Tglab</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.filter((item) => permissions.includes(item.permission)).map((item) => {
          const Icon = item.icon
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`)

          if (!item.ready) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/60 cursor-default"
                title="Скоро"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <span className="text-[10px] uppercase tracking-wide">скоро</span>
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
