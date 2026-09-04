'use client'

import { Button, Skeleton } from '@doska/ui'
import {
  THREADS_GEN_MODE_LABELS,
  useThreadsGenerationPreview,
  type ThreadsGenMode,
} from '@doska/shared'
import { AlertCircle, RefreshCcw } from 'lucide-react'

/**
 * The exact system and user prompts the generator would send right now,
 * built by the backend from the saved settings. If anything is missing the
 * backend says so here instead of quietly substituting a default.
 */
export function PromptPreview({ accountId }: { accountId: number }) {
  const { data, isLoading, isFetching, refetch } = useThreadsGenerationPreview(accountId)

  return (
    <section className="space-y-3 rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">Что получит модель</h3>
          <p className="text-sm text-muted-foreground">
            Собрано из сохранённых настроек. Скрытых подстановок нет: пустые поля просто не попадают в текст.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {isLoading || !data ? (
        <div className="space-y-2" aria-busy>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Модель {data.model}, режим «{THREADS_GEN_MODE_LABELS[data.mode as ThreadsGenMode] ?? data.mode}»,
            постов за запуск: {data.num_posts}, собранных трендов: {data.trends_count}.
          </p>

          {data.blockers.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
              {data.blockers.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>{b}</span>
                </li>
              ))}
              <li className="pl-6 text-xs text-muted-foreground">Пока это не исправлено, генерация не запустится.</li>
            </ul>
          )}

          {data.system_prompt && (
            <PromptBlock title="Системный промпт (персона)" text={data.system_prompt} />
          )}
          {data.user_prompt && <PromptBlock title="Задание" text={data.user_prompt} />}
        </>
      )}
    </section>
  )
}

function PromptBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{title}</p>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed">
        {text}
      </pre>
    </div>
  )
}
