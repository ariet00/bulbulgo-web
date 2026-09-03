'use client'

import { useState } from 'react'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@doska/ui'
import { cn, PLATFORM_LABELS, type ContentAccount } from '@doska/shared'
import { Link, useRouter } from '@doska/i18n'
import { MoreHorizontal } from 'lucide-react'

import { DeleteAccountDialog } from './DeleteAccountDialog'
import { PlatformMark } from './PlatformMark'

export function AccountCard({ account }: { account: ContentAccount }) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const href = `/${account.id}`
  const title = account.display_name || `@${account.username}`

  return (
    <>
      <article
        className={cn(
          'group relative flex flex-col gap-4 rounded-xl border bg-card p-5',
          'transition-colors hover:border-brand/60 focus-within:border-brand/60',
        )}
      >
        <div className="flex items-start gap-3">
          <PlatformMark platform={account.platform} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">
              {PLATFORM_LABELS[account.platform]}
            </p>
            <h2 className="truncate text-lg font-semibold leading-tight">
              <Link
                href={href}
                className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
              >
                {title}
              </Link>
            </h2>
          </div>

          {/* Above the stretched link so the menu stays clickable. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative z-10 -mr-2 -mt-1 h-8 w-8 text-muted-foreground"
                aria-label={`Действия для ${title}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => router.push(href)}>Открыть</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setConfirmOpen(true)}
              >
                Отключить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="truncate text-muted-foreground">@{account.username}</span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                account.is_active ? 'bg-success' : 'bg-destructive',
              )}
            />
            {account.is_active ? 'Активен' : 'Не активен'}
          </span>
        </div>
      </article>

      <DeleteAccountDialog account={account} open={confirmOpen} onOpenChange={setConfirmOpen} />
    </>
  )
}
