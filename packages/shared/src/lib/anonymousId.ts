const ANONYMOUS_ID_KEY = 'analytics_anonymous_id'
const DEVICE_ID_KEY = 'analytics_device_id'

function generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readOrCreate(key: string): string {
    if (typeof window === 'undefined') return ''
    try {
        let id = window.localStorage.getItem(key)
        if (!id) {
            id = generateId()
            window.localStorage.setItem(key, id)
        }
        return id
    } catch {
        return ''
    }
}

export function getAnonymousId(): string {
    return readOrCreate(ANONYMOUS_ID_KEY)
}

export function getDeviceId(): string {
    return readOrCreate(DEVICE_ID_KEY)
}

export function getDeviceInfo(): string {
    if (typeof navigator === 'undefined') return ''
    // Keep it short — backend stores in a String column. Combine platform +
    // browser name so we can group by browser without parsing the full UA.
    const platform = navigator.platform || ''
    const ua = navigator.userAgent || ''
    // First token of UA up to the first ')' usually identifies the browser/OS
    // family, e.g. "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)".
    const head = ua.split(')')[0]
    return `${platform}; ${head})`.slice(0, 200)
}
