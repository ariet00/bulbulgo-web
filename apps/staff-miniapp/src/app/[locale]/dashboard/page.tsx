'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

import { staffApi } from '@/apis/staff'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const tRoles = useTranslations('roles')

  const { data: me, isLoading } = useQuery({
    queryKey: ['staff', 'me'],
    queryFn: staffApi.me,
  })

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        …
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
      </header>

      {me && (
        <section className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('company')}</span>
            <span className="font-medium">{me.company.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('yourRole')}</span>
            <span className="font-medium">{tRoles(me.role)}</span>
          </div>
        </section>
      )}

      <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
    </main>
  )
}
