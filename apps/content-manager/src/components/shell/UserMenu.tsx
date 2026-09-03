'use client'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@doska/ui'
import { useUserStore } from '@doska/shared'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export function UserMenu() {
  const user = useUserStore((s) => s.user)
  if (!user) return null

  // Email is the only identity we are sure the person recognises; a login
  // username is never shown as a name.
  const label = user.email || 'Аккаунт'
  const initial = (user.email?.[0] || '•').toUpperCase()

  const handleSignOut = () => {
    useUserStore.getState().clearUser()
    signOut({ callbackUrl: '/login' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Меню пользователя">
          <Avatar className="h-8 w-8">
            {user.avatar && <AvatarImage src={user.avatar} alt="" />}
            <AvatarFallback className="bg-secondary text-xs font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">Вход через Google</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
