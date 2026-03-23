'use client'

import QueryProvider from '@/providers/QueryProvider'
import { ReactNode, useEffect } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'


export function Providers({ children, session }: {
  children: ReactNode,
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
