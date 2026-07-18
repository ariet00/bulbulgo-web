import { getMe, authOptions, Providers, NotificationSystem, NotificationHandler } from '@doska/shared'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Geist, Geist_Mono } from 'next/font/google'
import { SITE_URL } from '@/lib/site-url'
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
  metadataBase: new URL(SITE_URL),
  title: 'BulBul Go',
  description: 'BulBul Go — сервис для поиска попутчиков по всему Кыргызстану.',
  icons: { icon: '/favicon.png' },
  openGraph: {
    type: 'website',
    siteName: 'BulBul Go',
    locale: 'ru_RU',
    title: 'BulBul Go — поиск попутчиков по Кыргызстану',
    description: 'BulBul Go — сервис для поиска попутчиков по всему Кыргызстану.',
  },
  twitter: {
    card: 'summary_large_image',
  },
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
  const session = await getServerSession(authOptions);
  if (session) {
    try {
      const user = await getMe()
      session.user = user || session.user || {}
    } catch (error) {
      console.warn("Failed to fetch user in layout:", error)
    }
  }
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
