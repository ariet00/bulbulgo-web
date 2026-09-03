import { getMe, authOptions, Providers, NotificationSystem, NotificationHandler } from '@doska/shared'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Golos_Text, Unbounded } from 'next/font/google'
import '../globals.css'

// Golos Text is drawn for Russian-language interfaces; Unbounded carries the
// wordmark and page titles. Both ship Cyrillic, unlike the Geist default.
const golos = Golos_Text({
  variable: '--font-golos',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

const unbounded = Unbounded({
  variable: '--font-unbounded',
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BulBul Social',
    template: '%s – BulBul Social',
  },
  description:
    'Соцсети вашего бизнеса в одном рабочем месте: публикации, ответы и статистика.',
  applicationName: 'BulBul Social',
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()
  const session = await getServerSession(authOptions)
  if (session) {
    try {
      const user = await getMe()
      session.user = user || session.user || {}
    } catch (error) {
      console.warn('Failed to fetch user in layout:', error)
    }
  }
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${golos.variable} ${unbounded.variable} flex min-h-screen flex-col bg-background font-sans text-foreground antialiased`}
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
