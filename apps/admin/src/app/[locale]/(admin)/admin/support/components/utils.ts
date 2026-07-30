// Username of the global «Техподдержка» account (backend
// settings.SUPPORT_USER_USERNAME). A support chat is any chat where this
// account is one of the two participants.
export const SUPPORT_USERNAME = 'support'

export type Participant = {
    id?: number
    username?: string | null
    full_name?: string | null
    email?: string | null
    phone?: string | null
    avatar_url?: string | null
} | null

export type SupportChat = {
    id: number
    initiator_id: number
    receiver_id: number
    initiator?: Participant
    receiver?: Participant
    last_message?: { content?: string | null; sender_id: number; is_read?: boolean } | null
    last_message_at?: string | null
    category?: string | null
}

const isSupport = (p: Participant | undefined) =>
    p?.username === SUPPORT_USERNAME

/** The user side of a support chat — whichever participant is not «support». */
export function otherParty(chat: SupportChat): Participant {
    return (isSupport(chat.initiator) ? chat.receiver : chat.initiator) ?? null
}

/** The support account's user id within a chat (for classifying message sides). */
export function supportId(chat: SupportChat): number | null {
    if (isSupport(chat.initiator)) return chat.initiator_id
    if (isSupport(chat.receiver)) return chat.receiver_id
    return null
}

/** Display name for a chat participant — never falls back to username/email. */
export function displayName(p: Participant): string {
    return p?.full_name?.trim() || `Пользователь ${p?.id ?? '—'}`
}

export function initials(p: Participant): string {
    const name = p?.full_name?.trim()
    if (name) {
        const parts = name.split(/\s+/).slice(0, 2)
        return parts.map((s) => s[0]?.toUpperCase() ?? '').join('') || '—'
    }
    return '—'
}

/**
 * A chat is "unread" for support when its last message came from the user and
 * hasn't been read yet. No server-side unread count exists — this last-message
 * heuristic is enough for the inbox indicator.
 */
export function isUnread(chat: SupportChat): boolean {
    const last = chat.last_message
    const sid = supportId(chat)
    if (!last || sid == null) return false
    return last.sender_id !== sid && last.is_read === false
}

/** Compact relative time in Russian: «5 мин», «3 ч», «2 дн», else a date. */
export function relativeTime(iso?: string | null): string {
    if (!iso) return ''
    const then = new Date(iso).getTime()
    if (Number.isNaN(then)) return ''
    const diff = Date.now() - then
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'сейчас'
    if (min < 60) return `${min} мин`
    const hours = Math.floor(min / 60)
    if (hours < 24) return `${hours} ч`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} дн`
    return new Date(iso).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
    })
}

/** Clock time for a message bubble, e.g. «14:03». */
export function clockTime(iso?: string | null): string {
    if (!iso) return ''
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
