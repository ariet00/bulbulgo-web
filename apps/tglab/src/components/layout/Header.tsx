'use client'

import { Button } from '@doska/ui'
import { LogOut } from 'lucide-react'

import { useLogout } from '@/hooks/mutations'
import { useAuthStore } from '@/store/useAuthStore'

export function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <header className="h-14 border-b flex items-center justify-end gap-4 px-4 lg:px-6">
      <div className="text-right leading-tight">
        <div className="text-sm font-medium">{user?.full_name || user?.username}</div>
        <div className="text-xs text-muted-foreground">
          {user?.quotas.max_accounts} аккаунтов · {user?.quotas.max_running_tasks} задач
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        title="Выйти"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  )
}
