'use client'

import { Calendar, CalendarClock, Home, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useBookingStore } from '@/store/useBookingStore'

type Item = {
  href: string
  icon: typeof Home
  label: string
  ownerOnly?: boolean
  legalOnly?: boolean
}

const ALL_ITEMS: Item[] = [
  { href: '/owner', icon: Home, label: 'Главная' },
  { href: '/owner/calendar', icon: Calendar, label: 'Календарь' },
  { href: '/owner/schedule', icon: CalendarClock, label: 'Расписание', ownerOnly: true },
  { href: '/owner/clients', icon: Users, label: 'Клиенты' },
  { href: '/owner/settings', icon: Settings, label: 'Ещё', ownerOnly: true },
]

export function OwnerNav() {
  const pathname = usePathname()
  const normalized = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'
  const { isOwner, business } = useBookingStore()
  const isLegal = business?.company?.legal_form === 'legal'

  const items = ALL_ITEMS.filter((it) => {
    if (it.ownerOnly && !isOwner) return false
    if (it.legalOnly && !isLegal) return false
    return true
  })

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t bg-background z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className="mx-auto max-w-md grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
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
