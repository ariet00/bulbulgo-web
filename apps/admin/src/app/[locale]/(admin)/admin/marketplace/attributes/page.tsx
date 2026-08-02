'use client'

import { useState } from 'react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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
} from '@doska/ui'
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import type { McAttribute } from '@/apis/marketplace'
import { useMpAttributes, useMpCategories } from '@/hooks/queries/marketplace'
import { useMpDeleteAttribute } from '@/hooks/mutations/marketplace'
import { AttributeDialog } from '@/components/admin/marketplace/AttributeDialog'
import { flattenTree, pickLabel } from '@/components/admin/marketplace/shared'

const ALL = '__all__'

export default function MarketplaceAttributesPage() {
    const { data: attributes, isLoading } = useMpAttributes(true)
    const { data: categories } = useMpCategories(true)
    const del = useMpDeleteAttribute()
    const [dialog, setDialog] = useState<{ open: boolean; attribute?: McAttribute | null }>({
        open: false,
    })
    // словарь у каждой вертикали свой, поэтому список фильтруется по разделу
    const [vertical, setVertical] = useState<string>(ALL)

    const roots = categories ?? []
    const slugsOf = (rootSlug: string) => {
        const root = roots.find((r) => r.slug === rootSlug)
        return new Set(flattenTree(root ? [root] : []).map(({ node }) => node.slug))
    }
    const visible = (attributes ?? []).filter(
        (a) => vertical === ALL || slugsOf(vertical).has(a.category_slug ?? ''),
    )

    return (
        <div className="space-y-4 p-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Tags className="h-5 w-5" /> Атрибуты
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Select value={vertical} onValueChange={setVertical}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Все разделы</SelectItem>
                                {roots.map((r) => (
                                    <SelectItem key={r.id} value={r.slug}>
                                        {pickLabel(r.label, r.slug)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            size="sm"
                            onClick={() =>
                                setDialog({
                                    open: true,
                                    attribute: null,
                                })
                            }
                        >
                            <Plus className="mr-1 h-4 w-4" /> Новый атрибут
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 text-center text-muted-foreground">Загрузка…</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Название</TableHead>
                                    <TableHead>Раздел</TableHead>
                                    <TableHead>Ключ</TableHead>
                                    <TableHead>Тип</TableHead>
                                    <TableHead>Значения</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead className="text-right">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visible.map((a) => (
                                    <TableRow key={a.id} className={a.is_active ? '' : 'opacity-50'}>
                                        <TableCell className="font-medium">
                                            {pickLabel(a.label, a.key)}
                                            {a.unit && (
                                                <span className="ml-1 text-xs text-muted-foreground">
                                                    ({pickLabel(a.unit)})
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {a.category_slug ?? '—'}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{a.key}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="secondary">{a.type}</Badge>
                                                {a.role === 'system' && (
                                                    <Badge variant="outline">системный</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {a.options.length
                                                ? a.options.map((o) => o.value).join(', ')
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {a.is_active ? (
                                                <Badge variant="outline">активен</Badge>
                                            ) : (
                                                <Badge variant="secondary">скрыт</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => setDialog({ open: true, attribute: a })}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {a.is_active && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive"
                                                    onClick={() => {
                                                        if (confirm(`Скрыть атрибут «${pickLabel(a.label, a.key)}»?`))
                                                            del.mutate(a.id)
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {visible.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                            Нет атрибутов
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {dialog.open && (
                <AttributeDialog
                    open={dialog.open}
                    onOpenChange={(v) => setDialog((s) => ({ ...s, open: v }))}
                    attribute={dialog.attribute}
                    defaultCategoryId={
                        vertical === ALL
                            ? null
                            : (roots.find((r) => r.slug === vertical)?.id ?? null)
                    }
                />
            )}
        </div>
    )
}
