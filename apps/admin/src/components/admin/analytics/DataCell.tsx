'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    TableCell,
} from '@doska/ui'
import { cn } from '@doska/shared'

// Ширина колонки `data` в таблицах событий. У td в table-auto ширина считается
// по контенту, поэтому её задаём явно — и в <th>, и в обёртке ячейки.
export const DATA_COLUMN_WIDTH = 'w-[26rem]'

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
    // line-clamp сам выставляет display:-webkit-box, поэтому рядом не должно
    // быть `block` — иначе клэмп не применяется и строка таблицы растягивается
    // на всю длину JSON.
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="w-full text-left font-mono text-xs text-primary hover:underline line-clamp-2 break-words"
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


// Готовая ячейка таблицы под `data` — держит ширину колонки, чтобы длинный JSON
// не растягивал таблицу и не схлопывал колонку в пару символов.
export function DataTableCell(props: {
    data: Record<string, unknown> | null
    eventType: string
}) {
    return (
        <TableCell className="align-top">
            <div className={cn(DATA_COLUMN_WIDTH, 'max-w-full')}>
                <DataCell {...props} />
            </div>
        </TableCell>
    )
}
