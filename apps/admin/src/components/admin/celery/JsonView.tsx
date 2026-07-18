'use client'

// Syntax-highlighted, pretty-printed JSON. Colors are theme-aware (light/dark).
// The value is escaped for HTML before tokenizing, so task args with <, >, &
// can't inject markup.

const TOKEN_CLASS: Record<string, string> = {
    key: 'text-sky-700 dark:text-sky-300',
    string: 'text-emerald-700 dark:text-emerald-400',
    number: 'text-amber-700 dark:text-amber-400',
    boolean: 'text-purple-700 dark:text-purple-400',
    null: 'text-muted-foreground',
}

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlight(json: string): string {
    const escaped = escapeHtml(json)
    return escaped.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
            let cls = 'number'
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? 'key' : 'string'
            } else if (/true|false/.test(match)) {
                cls = 'boolean'
            } else if (/null/.test(match)) {
                cls = 'null'
            }
            return `<span class="${TOKEN_CLASS[cls]}">${match}</span>`
        }
    )
}

export function JsonView({ value }: { value: unknown }) {
    let text: string
    try {
        text = JSON.stringify(value, null, 2)
    } catch {
        text = String(value)
    }
    if (text === undefined) text = 'undefined'
    return (
        <pre
            className="rounded-md border bg-muted/40 p-3 text-xs leading-relaxed overflow-x-auto whitespace-pre font-mono"
            dangerouslySetInnerHTML={{ __html: highlight(text) }}
        />
    )
}
