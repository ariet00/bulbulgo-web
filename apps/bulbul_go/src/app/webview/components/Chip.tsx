'use client'

// Стандартный чип webview-сервисов (фильтры, пикеры форм): rounded-full,
// активный — мягкая заливка акцента (--wv-accent из theme.css), неактивный —
// вложенная заливка --muted (в приложении чипы лежат на surfaceContainerHigh).

export function Chip({
    active,
    onClick,
    children,
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            className={
                'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ' +
                (active
                    ? 'border-[var(--wv-accent-border)] bg-[var(--wv-accent-soft)] text-[var(--wv-accent)]'
                    : 'border-border bg-muted text-muted-foreground active:bg-secondary')
            }
        >
            {children}
        </button>
    )
}
