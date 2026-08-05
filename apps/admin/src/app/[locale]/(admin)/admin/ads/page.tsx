'use client'

import { useAdminDeleteAd, useAdminUpdateAd } from '@/hooks/mutations/admin'
import { useAdminAds } from '@/hooks/queries/admin'
import { useDebounce } from '@doska/shared'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Pagination,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Link, useRouter } from '@doska/i18n'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'
import type { AdminAd } from '@/apis/admin'
import { PLACEMENTS } from '@/components/admin/ads/AdForm'
import { useFilterParams } from '@/hooks/useFilterParams'
import { useConfirm } from '@/components/admin/ConfirmProvider'

const ALL = '__all__'

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
    placement: ALL,
    is_active: ALL,
}

function placementLabel(value: string) {
    return PLACEMENTS.find((p) => p.value === value)?.label ?? value
}

export default function AdminAdsPage() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)
    const [qInput, setQInput] = useState(values.q)
    const dq = useDebounce(qInput, 300)
    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq })
    }, [dq, values.q, setValues])

    const { data, isLoading } = useAdminAds(values.page, values.size, {
        q: values.q || undefined,
        placement: values.placement === ALL ? undefined : values.placement,
        is_active: values.is_active === ALL ? undefined : values.is_active === 'true',
    })

    const deleteMutation = useAdminDeleteAd()
    const updateMutation = useAdminUpdateAd()
    const router = useRouter()
    const confirm = useConfirm()

    const handleDelete = async (e: MouseEvent, id: number) => {
        e.stopPropagation()
        if (await confirm(`Удалить рекламу #${id}?`)) {
            deleteMutation.mutate(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">Реклама</h1>
                <Button asChild size="sm">
                    <Link href="/admin/ads/new">
                        <Plus className="size-4 mr-1" /> Создать
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Промо-объявления в приложении</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Input
                            placeholder="Поиск по заголовку…"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={values.placement}
                            onValueChange={(v) => setValues({ placement: v })}
                        >
                            <SelectTrigger className="w-full sm:w-64">
                                <SelectValue placeholder="Слот" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все слоты</SelectItem>
                                {PLACEMENTS.map((p) => (
                                    <SelectItem key={p.value} value={p.value}>
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={values.is_active}
                            onValueChange={(v) => setValues({ is_active: v })}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все</SelectItem>
                                <SelectItem value="true">Активные</SelectItem>
                                <SelectItem value="false">Выключенные</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div>Загрузка…</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead></TableHead>
                                        <TableHead>Заголовок</TableHead>
                                        <TableHead>Слот</TableHead>
                                        <TableHead>Порядок</TableHead>
                                        <TableHead>Активна</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.items.map((a: AdminAd) => (
                                        <TableRow
                                            key={a.id}
                                            className="cursor-pointer"
                                            onClick={() => router.push(`/admin/ads/${a.id}`)}
                                        >
                                            <TableCell>{a.id}</TableCell>
                                            <TableCell>
                                                {a.image_url ? (
                                                    <img
                                                        src={a.image_url}
                                                        alt=""
                                                        className="h-8 w-14 rounded object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {a.title?.ru ||
                                                    Object.values(a.title ?? {})[0] ||
                                                    '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {placementLabel(a.placement)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{a.sort_order}</TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Switch
                                                    checked={a.is_active}
                                                    onCheckedChange={(checked) =>
                                                        updateMutation.mutate({
                                                            id: a.id,
                                                            body: { is_active: checked },
                                                        })
                                                    }
                                                    disabled={updateMutation.isPending}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={(e) => handleDelete(e, a.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data && data.items.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                Ничего не найдено
                                            </TableCell>
                                        </TableRow>
                                    )}
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
