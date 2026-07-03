'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@doska/ui'
import {
    ArrowLeft,
    CheckCircle,
    ExternalLink,
    RotateCcw,
    Trash2,
    XCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAdminComplaint } from '@/hooks/queries/admin'
import {
    useAdminDeleteComplaint,
    useAdminSetComplaintStatus,
} from '@/hooks/mutations/admin'
import { StatusBadge, targetHref, targetTypeLabel } from '../helpers'

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 py-2 border-b last:border-0">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <div className="text-sm">{children}</div>
        </div>
    )
}

export default function ComplaintDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = parseInt(String(params.id), 10)

    const { data: c, isLoading } = useAdminComplaint(id)
    const setStatus = useAdminSetComplaintStatus()
    const deleteComplaint = useAdminDeleteComplaint()

    if (isLoading) return <div className="p-6">Загрузка...</div>
    if (!c) return <div className="p-6">Жалоба не найдена</div>

    const href = targetHref(c.target)
    const reporterName =
        c.reporter?.full_name ||
        c.reporter?.name ||
        (c.reporter?.username ? `@${c.reporter.username}` : c.reporter_id ? `#${c.reporter_id}` : 'Аноним')

    const handleDelete = () => {
        if (confirm('Удалить жалобу без возможности восстановления?')) {
            deleteComplaint.mutate(id, { onSuccess: () => router.push('/admin/complaints') })
        }
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/complaints')}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Назад
                    </Button>
                    <h1 className="text-2xl font-bold">Жалоба #{c.id}</h1>
                    <StatusBadge status={c.status} />
                </div>
                <div className="flex gap-2">
                    {c.status !== 'resolved' && (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={setStatus.isPending}
                            onClick={() => setStatus.mutate({ id, status: 'resolved' })}
                        >
                            <CheckCircle className="h-4 w-4 mr-1 text-green-600" /> Решена
                        </Button>
                    )}
                    {c.status !== 'dismissed' && (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={setStatus.isPending}
                            onClick={() => setStatus.mutate({ id, status: 'dismissed' })}
                        >
                            <XCircle className="h-4 w-4 mr-1 text-gray-500" /> Отклонить
                        </Button>
                    )}
                    {c.status !== 'open' && (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={setStatus.isPending}
                            onClick={() => setStatus.mutate({ id, status: 'open' })}
                        >
                            <RotateCcw className="h-4 w-4 mr-1" /> Вернуть в работу
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleteComplaint.isPending}
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4 mr-1" /> Удалить
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Жалоба</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InfoRow label="Причина">{c.reason}</InfoRow>
                        <InfoRow label="Описание">{c.description || '—'}</InfoRow>
                        <InfoRow label="Создана">
                            {format(new Date(c.created_at), 'dd.MM.yyyy HH:mm')}
                        </InfoRow>
                        {c.resolved_at && (
                            <InfoRow label="Обработана">
                                {format(new Date(c.resolved_at), 'dd.MM.yyyy HH:mm')}
                                {c.resolved_by_id ? (
                                    <>
                                        {' '}·{' '}
                                        <Link
                                            href={`/admin/users/${c.resolved_by_id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            админ #{c.resolved_by_id}
                                        </Link>
                                    </>
                                ) : null}
                            </InfoRow>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Участники</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InfoRow label="Кто пожаловался">
                            {c.reporter_id ? (
                                <Link
                                    href={`/admin/users/${c.reporter_id}`}
                                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                    {reporterName}
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            ) : (
                                <span className="text-muted-foreground">Аноним</span>
                            )}
                            {c.reporter?.phone && (
                                <span className="text-muted-foreground"> · {c.reporter.phone}</span>
                            )}
                        </InfoRow>
                        <InfoRow label={`Объект — ${targetTypeLabel(c.target_type)}`}>
                            {href ? (
                                <Link
                                    href={href}
                                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                    {c.target?.label || `#${c.target_id}`}
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            ) : (
                                <span className="text-muted-foreground line-through">
                                    {c.target?.label || `#${c.target_id}`} (удалён)
                                </span>
                            )}
                            {c.target?.subtitle && (
                                <span className="text-muted-foreground"> · {c.target.subtitle}</span>
                            )}
                        </InfoRow>
                        {c.target?.owner_id && c.target.type !== 'user' && (
                            <InfoRow label="Владелец объекта">
                                <Link
                                    href={`/admin/users/${c.target.owner_id}`}
                                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                    Пользователь #{c.target.owner_id}
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </InfoRow>
                        )}
                    </CardContent>
                </Card>
            </div>

            {c.data && Object.keys(c.data).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Метаданные (data)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto">
                            {JSON.stringify(c.data, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
