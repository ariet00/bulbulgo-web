import type { Metadata } from 'next'
import InviteClient from './_InviteClient'

type Params = { params: Promise<{ code: string }> }

// Нормализуем код к формату бэка: заглавные, только буквы/цифры, максимум 6.
function normalizeCode(raw: string): string {
    return decodeURIComponent(raw)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6)
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { code } = await params
    const title = 'Приглашение в BulBul Go'
    const description =
        'Установите BulBul Go и введите промокод друга при регистрации.'
    return {
        title,
        description,
        openGraph: { title, description, url: `/i/${normalizeCode(code)}` },
    }
}

export default async function InvitePage({ params }: Params) {
    const { code } = await params
    return <InviteClient code={normalizeCode(code)} />
}
