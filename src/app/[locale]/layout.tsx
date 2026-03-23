import { getMe } from '@/apis/users'
import NotificationHandler from '@/components/notification/NotificationHandler'
import { NotificationSystem } from '@/components/NotificationSystem'
import { authOptions } from '@/lib/auth'
import { Providers } from '@/providers'
import type { Metadata } from 'next'
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
    const user = await getMe()
    session.user = user || session.user || {}
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
