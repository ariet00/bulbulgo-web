'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tabs,
    TabsList,
    TabsTrigger,
} from '@doska/ui'
import { useDebounce } from '@doska/shared'
import { Copy, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    GUIDE_CATEGORY_LABELS,
    type AdminNews,
    type AdminNewsKind,
} from '@/apis/admin'
import { useAdminNewsList } from '@/hooks/queries/admin'
import { useAdminDeleteNews } from '@/hooks/mutations/admin'
import { useFilterParams } from '@/hooks/useFilterParams'
import { useConfirm } from '@/components/admin/ConfirmProvider'

const ALL = '__all__'

const FILTER_DEFAULTS = {
    page: 1,
    size: 40,
    q: '',
    status: ALL,
    kind: 'news',
}

export default function AdminNewsPage() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)

    const [qInput, setQInput] = useState(values.q)
    const dq = useDebounce(qInput, 300)
    useEffect(() => {
        if (dq !== values.q) setValues({ q: dq })
    }, [dq, values.q, setValues])

    const kind = (values.kind === 'guide' ? 'guide' : 'news') as AdminNewsKind
    const { data, isLoading } = useAdminNewsList(values.page, values.size, {
        q: values.q || undefined,
        status: values.status === ALL ? undefined : values.status,
        kind,
    })
    const deleteNews = useAdminDeleteNews()
    const confirm = useConfirm()

    const handleDelete = async (n: AdminNews) => {
        const noun = n.kind === 'guide' ? 'гайд' : 'новость'
        if (await confirm(`Удалить ${noun} «${n.title}»?`)) {
            deleteNews.mutate(n.id)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Новости и обучение</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        {kind === 'guide' ? 'Гайды обучения' : 'Новости приложения'}
                    </CardTitle>
                    <Link href={`/admin/news/new?kind=${kind}`}>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Создать
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs
                        value={kind}
                        onValueChange={(v) => setValues({ kind: v, page: 1 })}
                    >
                        <TabsList>
                            <TabsTrigger value="news">Новости</TabsTrigger>
                            <TabsTrigger value="guide">Гайды обучения</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <p className="text-sm text-muted-foreground">
                        {kind === 'guide' ? (
                            <>
                                Обучающие статьи сервиса «Обучение» (webview{' '}
                                <b>training</b>): гайды и видео о том, как
                                пользоваться приложением. Порядок в списке — поле
                                «Позиция». Список виден, пока включён сервис{' '}
                                <b>training</b> в разделе «Сервисы».
                            </>
                        ) : (
                            <>
                                Полноэкранные статьи в приложении: открываются
                                пуш-рассылкой (кнопка «Диплинк для пуша») и из
                                карточки «Новости» на Главной. Карточка и пуши
                                работают, пока включён сервис <b>news</b> в разделе
                                «Сервисы».
                            </>
                        )}
                    </p>
                    <div className="flex flex-wrap items-end gap-2">
                        <Input
                            placeholder="Поиск по заголовку/тексту…"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            className="w-full sm:max-w-xs"
                        />
                        <Select
                            value={values.status}
                            onValueChange={(v) => setValues({ status: v })}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все статусы</SelectItem>
                                <SelectItem value="published">Опубликована</SelectItem>
                                <SelectItem value="draft">Черновик</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {isLoading ? (
                        <div>Загрузка...</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Заголовок</TableHead>
                                        {kind === 'guide' && (
                                            <>
                                                <TableHead>Категория</TableHead>
                                                <TableHead>Позиция</TableHead>
                                            </>
                                        )}
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Публикация</TableHead>
                                        <TableHead>Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.items.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={kind === 'guide' ? 7 : 5}
                                                className="text-center text-muted-foreground py-6"
                                            >
                                                {kind === 'guide'
                                                    ? 'Пока нет гайдов'
                                                    : 'Пока нет новостей'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {data?.items.map((n) => (
                                        <TableRow key={n.id}>
                                            <TableCell>{n.id}</TableCell>
                                            <TableCell className="max-w-[40ch]">
                                                <Link
                                                    href={`/admin/news/${n.id}`}
                                                    className="font-medium text-blue-600 hover:underline"
                                                >
                                                    {n.title}
                                                </Link>
                                            </TableCell>
                                            {kind === 'guide' && (
                                                <>
                                                    <TableCell className="whitespace-nowrap text-sm">
                                                        {n.category
                                                            ? GUIDE_CATEGORY_LABELS[
                                                                  n.category
                                                              ]
                                                            : '—'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {n.position}
                                                    </TableCell>
                                                </>
                                            )}
                                            <TableCell>
                                                <span
                                                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        n.status === 'published'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-200 text-gray-600'
                                                    }`}
                                                >
                                                    {n.status === 'published'
                                                        ? 'Опубликована'
                                                        : 'Черновик'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                {n.published_at
                                                    ? format(
                                                          new Date(n.published_at),
                                                          'dd.MM.yyyy HH:mm',
                                                      )
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Link href={`/admin/news/${n.id}`}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            title="Редактировать"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        title="Скопировать диплинк для пуша"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(
                                                                n.click_action,
                                                            )
                                                            toast.success('Диплинк скопирован')
                                                        }}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                    <a
                                                        href={n.public_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            title="Открыть страницу"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        title="Удалить"
                                                        disabled={deleteNews.isPending}
                                                        onClick={() => handleDelete(n)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
