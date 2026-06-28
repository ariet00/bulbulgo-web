'use client'

import QueryProvider from '../providers/QueryProvider'
import { useEffect } from 'react'
import { useUserStore } from '../store/useUserStore'
import { SessionProvider, useSession, signOut } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'

// Forces a re-login when the backend refresh token can no longer be exchanged
// (jwt callback set session.error = 'RefreshAccessTokenError'). Covers both the
// initial server session and later client-side session refreshes.
function AuthErrorGuard() {
  const { data } = useSession()
  const error = (data as any)?.error
  useEffect(() => {
    if (error === 'RefreshAccessTokenError') {
      useUserStore.getState().clearUser()
      signOut({ callbackUrl: '/login' })
    }
  }, [error])
  return null
}


export function Providers({ children, session }: {
  children: any,
  session: any
}) {
  useEffect(() => {
    useUserStore.setState({
      user: session?.user || null,
      token: session?.accessToken || null,
      refreshToken: session?.refreshToken || null,
      isAuthenticated: !!session?.user,
      _hasHydrated: true, // Assume hydrated if initialized from session
    })
  }, [session])

  return (
    <SessionProvider session={session}>
      <AuthErrorGuard />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider>
          {children}
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
