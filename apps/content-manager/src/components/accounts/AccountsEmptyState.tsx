import { PLATFORMS } from '@doska/shared'

import { AddAccountDialog } from '@/components/AddAccountDialog'

import { PlatformMark } from './PlatformMark'

export function AccountsEmptyState() {
  return (
    <section className="rounded-xl border border-dashed bg-card/60 px-6 py-14 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5">
        <div className="flex -space-x-2">
          {PLATFORMS.map((p) => (
            <PlatformMark key={p} platform={p} size="sm" className="ring-2 ring-card" />
          ))}
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-medium">Подключите первый аккаунт</h2>
          <p className="text-sm text-muted-foreground">
            Публикуйте посты, отвечайте на комментарии и смотрите статистику
            всех соцсетей из одного места. Начните с Threads: подключение
            занимает меньше минуты.
          </p>
        </div>
        <AddAccountDialog />
      </div>
    </section>
  )
}
