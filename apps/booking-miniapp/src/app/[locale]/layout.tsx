import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Toaster } from 'sonner'

import { QueryProvider } from '@/providers/QueryProvider'

import '../globals.css'

export const metadata: Metadata = {
  title: 'BulBul Booking',
  description: 'Онлайн-запись через Telegram',
}

// Telegram Mini App webview prefers no zoom & full-viewport — match that.
// `viewportFit: cover` is required for `env(safe-area-inset-*)` to resolve on iOS,
// so our bottom nav can lift above the home indicator.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
  viewportFit: 'cover',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-center" />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
