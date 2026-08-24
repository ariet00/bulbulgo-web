'use client'

import { Button } from '@doska/ui'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { useLogout } from '@/hooks/mutations'
import { useMe } from '@/hooks/queries'
import { useRouter } from '@/i18n/routing'
import { useAuthStore } from '@/store/useAuthStore'

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">{children}</div>
  )
}

/**
 * Guards the cabinet and draws its chrome.
 *
 * The session is a bearer token in localStorage, so the check has to happen on
 * the client — and only once the store has rehydrated, otherwise the first
 * frame would bounce a signed-in operator to /login.
 */
export function CabinetShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const hydrated = useAuthStore((s) => s.hydrated)
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useLogout()

  const { data: me, isError, error } = useMe()

  useEffect(() => {
    if (hydrated && !token) router.replace('/login')
  }, [hydrated, token, router])

  // Roles and quotas can change between sessions — trust the server's copy.
  useEffect(() => {
    if (me) setUser(me)
  }, [me, setUser])

  if (!hydrated || !token) {
    return (
      <Centered>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Centered>
    )
  }

  // 403 from /me means the account is alive but the tglab role was revoked —
  // a dead session would have been a 401 and refreshed (or bounced) already.
  const forbidden = (error as { response?: { status?: number } })?.response?.status === 403
  if (isError && forbidden) {
    return (
      <Centered>
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            У аккаунта нет доступа к кабинету. Обратитесь к администратору.
          </p>
          <Button variant="outline" onClick={() => logout.mutate()}>
            Выйти
          </Button>
        </div>
      </Centered>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <div className="lg:ml-60 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
