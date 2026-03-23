'use client'

import NotificationList from '@/components/notification/NotificationList'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from '@/i18n/routing'
import { isDev } from '@/lib/utils'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useUserStore } from '@/store/useUserStore'
import { Bell, LayoutDashboard, User } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import RegionSelector from './RegionSelector'
import SearchInput from './SearchInput'
import CompanySelector from './CompanySelector'
import { ThemeToggle } from './ThemeToggle'


export default function Navbar() {
  const { user } = useUserStore()
  const { unreadCount } = useNotificationStore()

  const t = useTranslations('Navbar')

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-primary cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            D
          </div>
          <span>Doska</span>
        </Link>

        <div className="hidden flex-1 items-center justify-center px-8 md:flex gap-4">

          <div className="flex w-full max-w-2xl items-center gap-2 bg-muted rounded-full px-2 border focus-within:ring-1 focus-within:ring-ring">
            <SearchInput/>
            <div className="h-6 w-px bg-border"/>
            <RegionSelector/>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isDev && user ? <CompanySelector/> : null}
          {/*<LanguageSwitcher />*/}
          <ThemeToggle/>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full cursor-pointer relative"
                >
                  <Bell className="h-5 w-5"/>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"/>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <NotificationList onClose={() => { }}/>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full cursor-pointer"
                >
                  <User className="h-5 w-5"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user.role_slug === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      className="cursor-pointer text-primary font-medium"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4"/>
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/account/profile" className="cursor-pointer">{t(
                    'settings')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages" className="cursor-pointer">{t(
                    'chat')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem
                  onClick={() => {
                    signOut()
                    useUserStore.getState().clearUser()
                  }} className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="cursor-pointer">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full cursor-pointer"
              >
                <User className="h-5 w-5"/>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
