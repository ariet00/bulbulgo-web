import { Badge } from '@doska/ui'

const STATUS_VARIANT: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    SUCCESS: 'default',
    STARTED: 'secondary',
    RETRY: 'outline',
    FAILURE: 'destructive',
}

export function StatusBadge({ status }: { status: string }) {
    return (
        <Badge variant={STATUS_VARIANT[status] ?? 'outline'}>{status}</Badge>
    )
}

export function formatDateTime(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('ru-RU')
}

export function formatRuntime(ms: number | null): string {
    if (ms == null) return '—'
    if (ms < 1000) return `${ms} ms`
    const s = ms / 1000
    if (s < 60) return `${s.toFixed(1)} s`
    const m = Math.floor(s / 60)
    return `${m}m ${Math.round(s % 60)}s`
}

export function formatUptime(seconds?: number): string {
    if (!seconds) return '—'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}ч ${m}м`
    return `${m}м`
}
