'use client'

// Стандартный пустой/ошибочный стейт webview-сервисов: иконка в мягком
// квадрате акцента, заголовок, подпись, опциональное действие.

export function EmptyState({
    icon,
    title,
    text,
    action,
}: {
    icon: React.ReactNode
    title: string
    text: string
    action?: React.ReactNode
}) {
    return (
        <div className="wv-rise flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--wv-accent-soft)] text-[var(--wv-accent)]">
                {icon}
            </div>
            <p className="text-[16px] font-semibold">{title}</p>
            <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">
                {text}
            </p>
            {action}
        </div>
    )
}
