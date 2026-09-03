'use client'

import { useState } from 'react'

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Pagination } from '@doska/ui'
import { useThreadsLogs } from '@doska/shared'
import { AlertCircle } from 'lucide-react'

const PAGE_SIZE = 20

// Background-task logs of the scraper/AI pipeline. Moved verbatim out of
// ThreadsAccountDetail; behaviour intentionally unchanged.
export function LogsTab({ accountId }: { accountId: number }) {
  const [logPage, setLogPage] = useState(1)
  const { data: logsData, isLoading: isLogsLoading } = useThreadsLogs({
    account_id: accountId,
    skip: (logPage - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  })

  return (
    <Card className="border-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle>Активность</CardTitle>
        <CardDescription>Логи фоновых задач для этого аккаунта.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[180px]">
                    Время
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">
                    Модуль
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">
                    Уровень
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Сообщение
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLogsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4">
                        <div className="h-4 w-32 bg-muted rounded" />
                      </td>
                      <td className="p-4">
                        <div className="h-4 w-20 bg-muted rounded" />
                      </td>
                      <td className="p-4">
                        <div className="h-4 w-16 bg-muted rounded" />
                      </td>
                      <td className="p-4">
                        <div className="h-4 w-full bg-muted rounded" />
                      </td>
                    </tr>
                  ))
                ) : logsData?.items?.length > 0 ? (
                  logsData.items.map((log: any) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                          {log.module}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            log.level === 'ERROR'
                              ? 'bg-red-100 text-red-700'
                              : log.level === 'WARNING'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {log.level === 'ERROR' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {log.level}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">{log.message}</p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                      Активности пока нет.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {logsData?.total > PAGE_SIZE && (
          <div className="mt-4">
            <Pagination page={logPage} total={logsData.total} size={PAGE_SIZE} onPageChange={setLogPage} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
