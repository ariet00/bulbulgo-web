import { authOptions, Providers, NotificationSystem, NotificationHandler } from '@doska/shared'
import type { Metadata, Viewport } from 'next'
import { getServerSession } from 'next-auth'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Doska',
  description: 'Bulletin Board',
}

// Отдаёт <meta name="color-scheme" content="light dark"> в <head> ещё до
// загрузки CSS — браузер красит холст документа по системной теме с первого
// кадра, поэтому при навигации нет белой вспышки у системно-тёмных.
export const viewport: Viewport = {
  colorScheme: 'light dark',
}


export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params
  const messages = await getMessages()
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    // Misconfigured auth (e.g. missing NEXTAUTH_SECRET in the deploy) must not
    // crash the whole app — render logged-out instead of a Server Components 500.
    console.error("getServerSession failed in layout:", error)
  }
  // Backend-session liveness (and re-fetching the fresh user) is handled in the
  // (admin) layout, which redirects to /login on a dead session.
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers session={session}>
            <NotificationSystem />
            <NotificationHandler />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
