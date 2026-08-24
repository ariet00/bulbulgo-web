'use client'

import { ChevronRight, Copy } from 'lucide-react'
import { useState } from 'react'

// Interactive, collapsible JSON tree. Objects/arrays are expandable nodes;
// primitives are colorized (theme-aware). First two levels open by default.

const CLS = {
    key: 'text-sky-700 dark:text-sky-300',
    string: 'text-emerald-700 dark:text-emerald-400',
    number: 'text-amber-700 dark:text-amber-400',
    boolean: 'text-purple-700 dark:text-purple-400',
    null: 'text-muted-foreground',
    punct: 'text-muted-foreground',
}

const INDENT = 14

function isExpandable(v: unknown): v is Record<string, unknown> | unknown[] {
    return v !== null && typeof v === 'object'
}

function Primitive({ value }: { value: unknown }) {
    if (value === null) return <span className={CLS.null}>null</span>
    if (value === undefined) return <span className={CLS.null}>undefined</span>
    switch (typeof value) {
        case 'string':
            return (
                <span className={`${CLS.string} whitespace-pre-wrap break-words`}>
                    &quot;{value}&quot;
                </span>
            )
        case 'number':
            return <span className={CLS.number}>{String(value)}</span>
        case 'boolean':
            return <span className={CLS.boolean}>{String(value)}</span>
        default:
            return <span>{String(value)}</span>
    }
}

function Node({
    name,
    value,
    depth,
}: {
    name?: string
    value: unknown
    depth: number
}) {
    const [open, setOpen] = useState(depth < 2)
    const pad = { paddingLeft: depth * INDENT }

    if (!isExpandable(value)) {
        return (
            <div className="flex gap-1.5 py-0.5" style={pad}>
                {name != null && <span className={CLS.key}>{name}:</span>}
                <Primitive value={value} />
            </div>
        )
    }

    const isArray = Array.isArray(value)
    const entries: [string, unknown][] = isArray
        ? (value as unknown[]).map((v, i) => [String(i), v])
        : Object.entries(value as Record<string, unknown>)
    const [openBr, closeBr] = isArray ? ['[', ']'] : ['{', '}']
    const label = isArray ? `${entries.length} items` : `${entries.length} keys`

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1 w-full text-left rounded hover:bg-muted/60 py-0.5"
                style={pad}
            >
                <ChevronRight
                    className={`size-3 shrink-0 text-muted-foreground transition-transform ${
                        open ? 'rotate-90' : ''
                    }`}
                />
                {name != null && <span className={CLS.key}>{name}:</span>}
                <span className={CLS.punct}>
                    {open
                        ? openBr
                        : `${openBr}${entries.length ? ` ${label} ` : ''}${closeBr}`}
                </span>
            </button>
            {open && (
                <>
                    {entries.map(([k, v]) => (
                        <Node
                            key={k}
                            name={k}
                            value={v}
                            depth={depth + 1}
                        />
                    ))}
                    <div className={CLS.punct} style={pad}>
                        <span className="pl-4">{closeBr}</span>
                    </div>
                </>
            )}
        </div>
    )
}

export function JsonView({ value }: { value: unknown }) {
    const [copied, setCopied] = useState(false)

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(value, null, 2))
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            /* clipboard unavailable — ignore */
        }
    }

    return (
        <div className="relative rounded-md border bg-muted/30 text-xs font-mono">
            <button
                type="button"
                onClick={onCopy}
                className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded border bg-background/80 px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
                <Copy className="size-3" />
                {copied ? 'Скопировано' : 'Копировать'}
            </button>
            <div className="overflow-x-auto p-3 pr-24">
                <Node value={value} depth={0} />
            </div>
        </div>
    )
}
