'use client'

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@doska/ui'
import { Contact, FolderKanban, ListChecks, Shield, Users } from 'lucide-react'

import { Link } from '@/i18n/routing'
import { StatusChip } from '@/components/common/StatusChip'
import {
  useAccounts,
  useAudiences,
  useMeta,
  useProjects,
  useProxies,
  useTasks,
} from '@/hooks/queries'
import { useAuthStore } from '@/store/useAuthStore'

function StatCard({
  label,
  icon: Icon,
  value,
  href,
  loading,
}: {
  label: string
  icon: typeof Users
  value?: number
  href?: string
  loading?: boolean
}) {
  const body = (
    <Card className={href ? 'transition-colors hover:border-primary/40' : 'opacity-60'}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-12" />
        ) : value === undefined ? (
          <div className="text-sm text-muted-foreground">скоро</div>
        ) : (
          <div className="text-3xl font-semibold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
  return href ? <Link href={href}>{body}</Link> : body
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: proxies, isLoading: proxiesLoading } = useProxies()
  const { data: accounts, isLoading: accountsLoading } = useAccounts({ size: 200 })
  const { data: audiences, isLoading: audiencesLoading } = useAudiences()
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: meta } = useMeta()

  // Status breakdown of the accounts — the number that actually matters daily.
  const byStatus = (accounts?.items ?? []).reduce<Record<string, number>>((acc, account) => {
    acc[account.status] = (acc[account.status] ?? 0) + 1
    return acc
  }, {})
  const frozen = (accounts?.items ?? []).filter((a) => a.is_frozen).length

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
        <StatCard
          label="Проекты"
          icon={FolderKanban}
          href="/projects"
          value={projects?.length ?? 0}
          loading={projectsLoading}
        />
        <StatCard
          label="Аккаунты"
          icon={Users}
          href="/accounts"
          value={accounts?.total ?? 0}
          loading={accountsLoading}
        />
        <StatCard
          label="Прокси"
          icon={Shield}
          href="/proxies"
          value={proxies?.length ?? 0}
          loading={proxiesLoading}
        />
        <StatCard
          label="Базы"
          icon={Contact}
          href="/audiences"
          value={audiences?.length ?? 0}
          loading={audiencesLoading}
        />
        <StatCard
          label="Задачи"
          icon={ListChecks}
          href="/tasks"
          value={tasks?.length ?? 0}
          loading={tasksLoading}
        />
      </div>

      {Object.keys(byStatus).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Состояние аккаунтов
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <StatusChip value={status} options={meta?.account_statuses} />
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
            {frozen > 0 && (
              <div className="flex items-center gap-2">
                <StatusChip value="frozen" options={meta?.account_statuses} />
                <span className="text-sm font-medium">{frozen}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
