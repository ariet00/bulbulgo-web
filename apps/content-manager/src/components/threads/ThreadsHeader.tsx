import { cn, type ContentAccount } from '@doska/shared'
import { ExternalLink } from 'lucide-react'

import { PlatformMark } from '@/components/accounts/PlatformMark'

export function ThreadsHeader({
  account,
  actions,
}: {
  account: ContentAccount
  actions?: React.ReactNode
}) {
  const avatar = account.data?.threads_profile_picture_url as string | undefined
  const bio = account.data?.threads_biography as string | undefined
  const title = account.display_name || account.username

  return (
    <header className="flex flex-col gap-5 border-b pb-6 md:flex-row md:items-start md:justify-between">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <PlatformMark platform="threads" size="lg" />
          )}
          <PlatformMark
            platform="threads"
            size="sm"
            className={cn('absolute -bottom-1 -right-1 ring-2 ring-background', !avatar && 'hidden')}
          />
        </div>
        <div className="min-w-0 space-y-1">
          <h1 className="truncate font-display text-2xl font-medium tracking-tight sm:text-3xl">{title}</h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <a
              href={`https://www.threads.net/@${account.username}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              @{account.username}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="inline-flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', account.is_active ? 'bg-success' : 'bg-destructive')} />
              {account.is_active ? 'Подключён' : 'Отключён'}
            </span>
          </p>
          {bio && <p className="max-w-prose text-sm text-muted-foreground">{bio}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
