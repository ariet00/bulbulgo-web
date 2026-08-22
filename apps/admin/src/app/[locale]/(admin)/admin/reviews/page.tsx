'use client'

import { useAdminReviews } from '@/hooks/queries/admin'
import { useAdminSetReviewStatus } from '@/hooks/mutations/admin'
import { useFilterParams } from '@/hooks/useFilterParams'
import { useDebounce } from '@doska/shared'
import { useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Pagination,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@doska/ui'
import { Eye, EyeOff, RefreshCw, X } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import type { AdminReview } from '@/apis/admin'
import {
    RatingStars,
    SERVICES,
    STATUSES,
    StatusBadge,
    SUBJECT_TYPES,
    serviceLabel,
    subjectHref,
    subjectTitle,
    subjectTypeLabel,
} from './helpers'

const ALL = '__all__'

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
    status: ALL,
    service: ALL,
    subject_type: ALL,
    rating: ALL,
    date_from: '',
    date_to: '',
}

const RATINGS = [5, 4, 3, 2, 1]

/** Имя пользователя для таблицы: username — это логин, в подписи не годится. */
function userLabel(
    user: { full_name: string | null } | null,
    id: number | null,
): string {
    return user?.full_name || (id != null ? `#${id}` : '—')
}

export default function ReviewsPage() {
    const { values, setValues, reset } = useFilterParams(FILTER_DEFAULTS)

    const [qInput, setQInput] = useState(values.q)
    const dq = useDebounce(qInput, 300)
    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq })
    }, [dq, values.q, setValues])

    const { data, isLoading, isFetching, refetch } = useAdminReviews(
        values.page,
        values.size,
        {
            q: values.q || undefined,
            status: values.status === ALL ? undefined : (values.status as any),
            service: values.service === ALL ? undefined : values.service,
            subject_type:
                values.subject_type === ALL ? undefined : (values.subject_type as any),
            rating: values.rating === ALL ? undefined : Number(values.rating),
            date_from: values.date_from || undefined,
            date_to: values.date_to || undefined,
        },
    )

    const setStatus = useAdminSetReviewStatus()

    const resetFilters = () => {
        setQInput('')
        reset()
    }

    const hasActiveFilters =
        !!values.q ||
        values.status !== ALL ||
        values.service !== ALL ||
        values.subject_type !== ALL ||
        values.rating !== ALL ||
        !!values.date_from ||
        !!values.date_to

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Отзывы</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Модерация отзывов</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Отзыв публикуется сразу. Скрытый виден только автору и не
                            влияет на рейтинг — он пересчитывается при каждом изменении.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`}
                        />
                        Обновить
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-end gap-2">
                        <Input
                            placeholder="Поиск по тексту или id отзыва/автора/получателя…"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={values.status}
                            onValueChange={(v) => setValues({ status: v })}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все статусы</SelectItem>
                                {STATUSES.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={values.service}
                            onValueChange={(v) => setValues({ service: v })}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Сервис" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все сервисы</SelectItem>
                                {SERVICES.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={values.subject_type}
                            onValueChange={(v) => setValues({ subject_type: v })}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="За что" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Любой объект</SelectItem>
                                {SUBJECT_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={String(values.rating)}
                            onValueChange={(v) => setValues({ rating: v })}
                        >
                            <SelectTrigger className="w-full sm:w-36">
                                <SelectValue placeholder="Оценка" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Любая оценка</SelectItem>
                                {RATINGS.map((r) => (
                                    <SelectItem key={r} value={String(r)}>
                                        {'★'.repeat(r)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">Дата от</span>
                            <Input
                                type="date"
                                value={values.date_from}
                                onChange={(e) => setValues({ date_from: e.target.value })}
                                className="w-full sm:w-40"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">до</span>
                            <Input
                                type="date"
                                value={values.date_to}
                                onChange={(e) => setValues({ date_to: e.target.value })}
                                className="w-full sm:w-40"
                            />
                        </div>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={resetFilters}>
                                <X className="h-4 w-4 mr-1" />
                                Сбросить
                            </Button>
                        )}
                    </div>
                    {isLoading ? (
                        <div>Загрузка...</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Дата</TableHead>
                                        <TableHead>Кто оставил</TableHead>
                                        <TableHead>О ком</TableHead>
                                        <TableHead>За что</TableHead>
                                        <TableHead>Сервис</TableHead>
                                        <TableHead>Оценка</TableHead>
                                        <TableHead>Текст</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.items.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={10}
                                                className="text-center text-muted-foreground py-6"
                                            >
                                                Ничего не найдено
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {data?.items.map((r: AdminReview) => {
                                        const href = subjectHref(r.subject_type, r.subject_id)
                                        const title = subjectTitle(r.subject, r.subject_id)
                                        const isHidden = r.status === 'hidden'
                                        return (
                                            <TableRow key={r.id}>
                                                <TableCell>{r.id}</TableCell>
                                                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                    {format(new Date(r.created_at), 'dd.MM.yyyy HH:mm')}
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={`/admin/users/${r.author_id}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {userLabel(r.author, r.author_id)}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    {r.target_user_id ? (
                                                        <Link
                                                            href={`/admin/users/${r.target_user_id}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {userLabel(r.target_user, r.target_user_id)}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground">
                                                            {subjectTypeLabel(r.subject_type)}
                                                        </span>
                                                        {href ? (
                                                            <Link
                                                                href={href}
                                                                className="text-blue-600 hover:underline max-w-[22ch] truncate"
                                                                title={title}
                                                            >
                                                                {title}
                                                            </Link>
                                                        ) : (
                                                            <span
                                                                className="max-w-[22ch] truncate text-muted-foreground"
                                                                title={title}
                                                            >
                                                                {title}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-sm">
                                                    {serviceLabel(r.service)}
                                                </TableCell>
                                                <TableCell>
                                                    <RatingStars rating={r.rating} />
                                                </TableCell>
                                                <TableCell
                                                    className="max-w-[32ch] truncate"
                                                    title={r.message || ''}
                                                >
                                                    {r.message || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={r.status} />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        title={isHidden ? 'Вернуть отзыв' : 'Скрыть отзыв'}
                                                        disabled={setStatus.isPending}
                                                        onClick={() =>
                                                            setStatus.mutate({
                                                                id: r.id,
                                                                status: isHidden ? 'approved' : 'hidden',
                                                            })
                                                        }
                                                    >
                                                        {isHidden ? (
                                                            <Eye className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <EyeOff className="h-4 w-4 text-gray-500" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {data && (
                        <Pagination
                            page={data.page}
                            total={data.total}
                            size={data.size}
                            onPageChange={(p) => setValues({ page: p })}
                            onSizeChange={(s) => setValues({ size: s })}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
