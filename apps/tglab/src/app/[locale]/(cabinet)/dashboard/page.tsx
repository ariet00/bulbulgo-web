'use client'

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@doska/ui'
import { Contact, FolderKanban, ListChecks, Shield, Users } from 'lucide-react'

import { useProjects } from '@/hooks/queries'
import { useAuthStore } from '@/store/useAuthStore'

/** Sections that exist in the domain model but ship in later stages — shown as
 *  placeholders so the cabinet reads as a whole from day one. */
const PENDING = [
  { label: 'Аккаунты', icon: Users },
  { label: 'Прокси', icon: Shield },
  { label: 'Базы', icon: Contact },
  { label: 'Задачи', icon: ListChecks },
]

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: projects, isLoading } = useProjects()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Привет, {user?.full_name || user?.username}
        </h1>
        <p className="text-sm text-muted-foreground">
          Лимиты: {user?.quotas.max_accounts} аккаунтов,{' '}
          {user?.quotas.max_running_tasks} одновременных задач.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FolderKanban className="h-4 w-4" />
              Проекты
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-3xl font-semibold">{projects?.length ?? 0}</div>
            )}
          </CardContent>
        </Card>

        {PENDING.map(({ label, icon: Icon }) => (
          <Card key={label} className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="h-4 w-4" />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">скоро</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
