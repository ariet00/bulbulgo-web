import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import { ThemedToaster } from '@/components/ThemedToaster'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'

import '../globals.css'

export const metadata: Metadata = {
  title: 'Tglab',
  description: 'Кабинет продвижения в Telegram',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
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
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              {children}
              <ThemedToaster />
            </QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
