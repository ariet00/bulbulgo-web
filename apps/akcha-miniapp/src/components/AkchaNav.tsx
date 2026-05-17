'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Home, History, HandCoins, Wallet, Settings } from 'lucide-react'

const items = [
  { href: '/dashboard', icon: Home, key: 'dashboard' },
  { href: '/transactions', icon: History, key: 'transactions' },
  { href: '/debts', icon: HandCoins, key: 'debts' },
  { href: '/wallets', icon: Wallet, key: 'wallets' },
  { href: '/settings', icon: Settings, key: 'settings' },
] as const

export function AkchaNav() {
  const t = useTranslations('nav')
  const pathname = usePathname() || ''

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/95 border-t backdrop-blur"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="grid grid-cols-5">
        {items.map(({ href, icon: Icon, key }) => {
          const active = pathname.endsWith(href)
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2 text-xs ${active ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Icon size={20} />
                <span>{t(key)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
