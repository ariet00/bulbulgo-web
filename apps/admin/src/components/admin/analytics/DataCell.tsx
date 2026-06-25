'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@doska/ui'

function formatValue(v: unknown): string {
    if (v === null || v === undefined) return '—'
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
}

// Renders an analytics event's `data` JSONB as a compact, tappable preview that
// opens a modal with a readable key→value list — friendlier than a raw JSON
// blob on mobile.
export function DataCell({
    data,
    eventType,
}: {
    data: Record<string, unknown> | null
    eventType: string
}) {
    const entries = data ? Object.entries(data) : []
    if (entries.length === 0) {
        return <span className="text-muted-foreground">—</span>
    }
    const preview = entries.map(([k, v]) => `${k}: ${formatValue(v)}`).join(' · ')
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="block max-w-[60ch] text-left font-mono text-xs text-primary hover:underline line-clamp-2 break-all"
                    title="Открыть data"
                >
                    {preview}
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-mono text-base">
                        {eventType}{' '}
                        <span className="text-muted-foreground font-normal text-sm">
                            · data ({entries.length})
                        </span>
                    </DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] space-y-2 overflow-auto">
                    {entries.map(([k, v]) => (
                        <div
                            key={k}
                            className="flex flex-col gap-0.5 border-b border-border/50 pb-2 last:border-0"
                        >
                            <span className="text-xs text-muted-foreground">{k}</span>
                            <span className="font-mono text-sm break-all">{formatValue(v)}</span>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
