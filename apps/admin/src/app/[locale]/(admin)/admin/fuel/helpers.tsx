// Лейблы enum'ов fuel-домена (админка — только ru).

export const FUEL_TYPE_LABELS: Record<string, string> = {
    ai92: 'АИ-92',
    ai95: 'АИ-95',
    ai98: 'АИ-98',
    dt: 'Дизель',
    gas: 'Газ',
}

export const STATUS_LABELS: Record<string, string> = {
    available: 'Есть топливо',
    low: 'Мало топлива',
    incoming: 'Ждём подвоз',
    queue: 'Очередь',
    out: 'Закончилось',
}

export const STATUS_COLORS: Record<string, string> = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    incoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    queue: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    out: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

export const QUEUE_LABELS: Record<string, string> = {
    none: 'Нет очереди',
    lt10: '< 10 мин',
    '10_30': '10–30 мин',
    gt30: '30+ мин',
}

export const RESTRICTION_LABELS: Record<string, string> = {
    limit: 'Лимит на отпуск',
    cash_only: 'Только наличные',
}

export function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800'}`}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    )
}
