'use client'

import { Button } from '@doska/ui'
import { threadsAccountHasScope, useStartThreadsOAuth, type ContentAccount } from '@doska/shared'
import { Loader2, RefreshCw } from 'lucide-react'

/**
 * Shown when the stored token predates `scope`. Reconnecting re-runs OAuth
 * with the full scope list; the backend upserts the same account row.
 */
export function ReconnectNotice({
  account,
  scope,
  children,
}: {
  account: ContentAccount
  scope: string
  children: React.ReactNode
}) {
  const start = useStartThreadsOAuth()
  if (threadsAccountHasScope(account, scope)) return null

  const reconnect = async () => {
    const { authorize_url } = await start.mutateAsync()
    // Full-page redirect — Meta does not allow consent in an iframe.
    window.location.href = authorize_url
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed bg-secondary/40 px-4 py-3 text-sm">
      <p className="text-muted-foreground">{children}</p>
      <Button type="button" size="sm" variant="outline" onClick={reconnect} disabled={start.isPending}>
        {start.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        Переподключить
      </Button>
    </div>
  )
}
