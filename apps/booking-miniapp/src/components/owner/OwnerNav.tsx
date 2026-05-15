'use client'

import { Calendar, Home, Scissors, Settings, Users, Wallet } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/owner', icon: Home, label: 'Главная' },
  { href: '/owner/calendar', icon: Calendar, label: 'Календарь' },
  { href: '/owner/services', icon: Scissors, label: 'Услуги' },
  { href: '/owner/clients', icon: Users, label: 'Клиенты' },
  { href: '/owner/finance', icon: Wallet, label: 'Финансы' },
  { href: '/owner/settings', icon: Settings, label: 'Ещё' },
]

export function OwnerNav() {
  const pathname = usePathname()
  // strip locale prefix like "/ru" so /ru/owner/calendar matches /owner/calendar
  const normalized = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-40">
      <div className="mx-auto max-w-md grid grid-cols-6">
        {items.map(({ href, icon: Icon, label }) => {
          const active =
            href === '/owner' ? normalized === '/owner' : normalized.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-2 text-[10px] ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="size-4 mb-0.5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
