const ANONYMOUS_ID_KEY = 'analytics_anonymous_id'

function generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getAnonymousId(): string {
    if (typeof window === 'undefined') return ''
    try {
        let id = window.localStorage.getItem(ANONYMOUS_ID_KEY)
        if (!id) {
            id = generateId()
            window.localStorage.setItem(ANONYMOUS_ID_KEY, id)
        }
        return id
    } catch {
        return ''
    }
}
