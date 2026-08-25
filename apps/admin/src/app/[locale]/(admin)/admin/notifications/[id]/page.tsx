'use client'

import { useAdminDeleteNotification } from '@/hooks/mutations/admin'
import { useAdminNotification } from '@/hooks/queries/admin'
import { Link, useRouter } from '@doska/i18n'
import {
    BackButton,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@doska/ui'
import { Trash2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { useConfirm } from '@/components/admin/ConfirmProvider'

function sourceBadge(source?: string) {
    if (source === 'admin') return <Badge variant="default">Админ</Badge>
    return <Badge variant="secondary">Система</Badge>
}

function statusBadge(status?: string) {
    switch (status) {
        case 'sent':
            return <Badge variant="default">Отправлено</Badge>
        case 'partial':
            return <Badge variant="outline">Частично</Badge>
        case 'failed':
            return <Badge variant="destructive">Ошибка</Badge>
        case 'no_devices':
            return <Badge variant="secondary">Нет устройств</Badge>
        case 'pending':
            return <Badge variant="outline">В очереди</Badge>
        default:
            return <span className="text-muted-foreground">—</span>
    }
}

// Ссылка на карточку пользователя. `name` — user.full_name с бэка; вложенный
// user есть только у получателя (и full_name пустой, если ФИО не заполнено),
// у отправителя показываем id.
function UserLink({ id, name }: { id?: number | null; name?: string | null }) {
    if (!id) return <span className="text-muted-foreground">—</span>
    return (
        <Link
            href={`/admin/users/${id}`}
            className="text-primary hover:underline"
        >
            {name || `#${id}`}
            {name && (
                <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                    #{id}
                </span>
            )}
        </Link>
    )
}

function Field({
    label,
    children,
}: {
    label: string
    children: ReactNode
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-muted-foreground">
                {label}
            </label>
            <div className="mt-1 text-base break-words">{children}</div>
        </div>
    )
}

export default function NotificationDetailPage() {
    const params = useParams()
    const rawId = params.id
    const id = rawId ? parseInt(Array.isArray(rawId) ? rawId[0] : rawId) : 0

    const { data: n, isLoading } = useAdminNotification(id)
    const deleteMutation = useAdminDeleteNotification()
    const router = useRouter()
    const confirm = useConfirm()

    const handleDelete = async () => {
        if (await confirm(`Удалить уведомление #${id}?`)) {
            deleteMutation.mutate(id, {
                onSuccess: () => router.push('/admin/notifications'),
            })
        }
    }

    if (isLoading) return <div>Загрузка…</div>
    if (!n) return <div>Уведомление не найдено</div>

    return (
        <div className="space-y-6">
            <BackButton />
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Уведомление #{n.id}</h1>
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Удалить
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Содержимое</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Field label="Заголовок">
                        <span className="font-medium whitespace-pre-wrap">
                            {n.title}
                        </span>
                    </Field>
                    <Field label="Текст">
                        <span className="whitespace-pre-wrap">{n.body}</span>
                    </Field>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Доставка</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Пользователь">
                            <UserLink id={n.user_id} name={n.user?.full_name} />
                        </Field>
                        <Field label="Тип">
                            {n.type}
                            {n.category ? ` / ${n.category}` : ''}
                        </Field>
                        <Field label="Источник">{sourceBadge(n.source)}</Field>
                        <Field label="Статус">{statusBadge(n.status)}</Field>
                        <Field label="Прочитано">
                            {n.is_read ? (
                                <Badge variant="secondary">Да</Badge>
                            ) : (
                                <Badge variant="outline">Нет</Badge>
                            )}
                        </Field>
                        <Field label="Отправитель">
                            <UserLink id={n.sent_by_id} />
                        </Field>
                        <Field label="Успешно">{n.success_count ?? '—'}</Field>
                        <Field label="Ошибок">{n.failure_count ?? '—'}</Field>
                        <Field label="Создано">
                            {n.created_at
                                ? new Date(n.created_at).toLocaleString()
                                : '—'}
                        </Field>
                    </div>
                    {n.error ? (
                        <div className="mt-4">
                            <Field label="Ошибка">
                                <span className="whitespace-pre-wrap text-destructive">
                                    {n.error}
                                </span>
                            </Field>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {n.data && Object.keys(n.data).length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Payload (data)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
                            {JSON.stringify(n.data, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    )
}
