'use client'

import { useMemo, useState } from 'react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Switch,
} from '@doska/ui'
import {
    ChevronDown,
    ChevronRight,
    FolderTree,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react'
import type { McAttribute, McCategoryNode, McGroup } from '@/apis/marketplace'
import {
    useMpAttributes,
    useMpCategories,
    useMpCategoryAttributes,
    useMpCategoryGroups,
    useMpCategoryBindings,
} from '@/hooks/queries/marketplace'
import {
    useMpDeleteBinding,
    useMpDeleteCategory,
    useMpDeleteGroup,
} from '@/hooks/mutations/marketplace'
import { CategoryDialog } from '@/components/admin/marketplace/CategoryDialog'
import { BindingDialog } from '@/components/admin/marketplace/BindingDialog'
import { GroupDialog } from '@/components/admin/marketplace/GroupDialog'
import { pickLabel } from '@/components/admin/marketplace/shared'

function flatten(nodes: McCategoryNode[], acc: Map<number, McCategoryNode>) {
    for (const n of nodes) {
        acc.set(n.id, n)
        flatten(n.children ?? [], acc)
    }
    return acc
}

export default function MarketplaceCategoriesPage() {
    const [showInactive, setShowInactive] = useState(true)
    const { data: tree, isLoading } = useMpCategories(showInactive)
    const { data: attributes } = useMpAttributes(true)
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [expanded, setExpanded] = useState<Set<number>>(new Set())

    const [catDialog, setCatDialog] = useState<{
        open: boolean
        category?: McCategoryNode | null
        parent?: McCategoryNode | null
    }>({ open: false })
    const [bindDialog, setBindDialog] = useState<{ open: boolean; binding?: any }>({ open: false })
    const [groupDialog, setGroupDialog] = useState<{ open: boolean; group?: McGroup | null }>({
        open: false,
    })

    const byId = useMemo(() => flatten(tree ?? [], new Map()), [tree])
    const selected = selectedId != null ? byId.get(selectedId) ?? null : null

    // группы для привязок: свои + унаследованные (резолвит бэкенд)
    const { data: groups } = useMpCategoryGroups(selectedId)
    const bindingGroups = groups ?? []
    const attrsById = useMemo(() => {
        const m = new Map<number, McAttribute>()
        for (const a of attributes ?? []) m.set(a.id, a)
        return m
    }, [attributes])

    const { data: bindings } = useMpCategoryBindings(selectedId)
    const { data: effective } = useMpCategoryAttributes(selectedId)
    const deleteCategory = useMpDeleteCategory()
    const deleteGroup = useMpDeleteGroup()
    const deleteBinding = useMpDeleteBinding()

    const toggle = (id: number) =>
        setExpanded((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })

    const renderNode = (node: McCategoryNode, depth: number): React.ReactNode => {
        const children = node.children ?? []
        const hasChildren = children.length > 0
        const open = expanded.has(node.id)
        const isSel = node.id === selectedId
        return (
            <div key={node.id}>
                <div
                    className={`group flex items-center gap-1.5 rounded-md px-2 py-1.5 cursor-pointer ${
                        isSel ? 'bg-primary/10' : 'hover:bg-muted/60'
                    } ${node.is_active ? '' : 'opacity-50'}`}
                    style={{ paddingLeft: depth * 18 + 8 }}
                    onClick={() => setSelectedId(node.id)}
                >
                    {hasChildren ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                toggle(node.id)
                            }}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-muted"
                        >
                            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                    ) : (
                        <span className="inline-block h-5 w-5 shrink-0" />
                    )}

                    <span className={isSel ? 'font-semibold' : ''}>{pickLabel(node.label, node.slug)}</span>
                    <span className="text-xs text-muted-foreground">/{node.slug}</span>
                    {!node.is_active && (
                        <Badge variant="secondary" className="text-[10px]">
                            скрыта
                        </Badge>
                    )}
                    {hasChildren && <span className="text-xs text-muted-foreground">· {children.length}</span>}

                    <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title="Подкатегория"
                            onClick={(e) => {
                                e.stopPropagation()
                                setCatDialog({ open: true, parent: node })
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title="Редактировать"
                            onClick={(e) => {
                                e.stopPropagation()
                                setCatDialog({ open: true, category: node })
                            }}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {node.is_active && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                title="Скрыть (soft-delete)"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (confirm(`Скрыть «${pickLabel(node.label, node.slug)}» и всё поддерево?`))
                                        deleteCategory.mutate(node.id)
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                </div>
                {hasChildren && open && <div>{children.map((c) => renderNode(c, depth + 1))}</div>}
            </div>
        )
    }

    return (
        <div className="space-y-4 p-4">
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Tree */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-2">
                            <FolderTree className="h-5 w-5" /> Категории
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Switch checked={showInactive} onCheckedChange={setShowInactive} />
                                скрытые
                            </label>
                            <Button size="sm" onClick={() => setCatDialog({ open: true, parent: null })}>
                                <Plus className="mr-1 h-4 w-4" /> Корневая
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="py-8 text-center text-muted-foreground">Загрузка…</div>
                        ) : (tree ?? []).length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">Пусто</div>
                        ) : (
                            <div className="max-h-[72vh] overflow-y-auto rounded-md border text-sm">
                                {(tree ?? []).map((n) => renderNode(n, 0))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Selected category */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {selected ? (
                                <span className="flex items-center gap-2">
                                    {pickLabel(selected.label, selected.slug)}
                                    <span className="font-mono text-xs text-muted-foreground">{selected.path}</span>
                                </span>
                            ) : (
                                <span className="text-muted-foreground">Выберите категорию</span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {selected && (
                            <>
                                {/* группы формы: свои и унаследованные */}
                                <section className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold">Группы полей</h3>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setGroupDialog({ open: true })}
                                        >
                                            <Plus className="mr-1 h-4 w-4" /> Группа
                                        </Button>
                                    </div>
                                    {bindingGroups.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">
                                            Групп нет — поля пойдут сплошным списком
                                        </div>
                                    ) : (
                                        <div className="divide-y rounded-md border">
                                            {bindingGroups.map((g) => (
                                                <div
                                                    key={g.id}
                                                    className={`flex items-center gap-2 px-3 py-2 text-sm ${
                                                        g.is_active ? '' : 'opacity-50'
                                                    }`}
                                                >
                                                    <span className="font-medium">
                                                        {pickLabel(g.label, g.key)}
                                                    </span>
                                                    <span className="font-mono text-xs text-muted-foreground">
                                                        {g.key}
                                                    </span>
                                                    {g.category_id !== selected.id && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            из «{g.category_slug}»
                                                        </span>
                                                    )}
                                                    <div className="ml-auto flex items-center gap-0.5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() =>
                                                                setGroupDialog({ open: true, group: g })
                                                            }
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        {g.is_active && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-destructive"
                                                                onClick={() => deleteGroup.mutate(g.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                {/* own bindings */}
                                <section className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold">Собственные атрибуты</h3>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setBindDialog({ open: true })}
                                        >
                                            <Plus className="mr-1 h-4 w-4" /> Привязать
                                        </Button>
                                    </div>
                                    {(bindings ?? []).length === 0 ? (
                                        <div className="text-sm text-muted-foreground">Нет привязок</div>
                                    ) : (
                                        <div className="divide-y rounded-md border">
                                            {(bindings ?? []).map((b) => {
                                                const a = attrsById.get(b.attribute_id)
                                                return (
                                                    <div
                                                        key={b.id}
                                                        className={`flex items-center gap-2 px-3 py-2 text-sm ${
                                                            b.is_active ? '' : 'opacity-50'
                                                        }`}
                                                    >
                                                        <span className="font-medium">
                                                            {pickLabel(a?.label, a?.key ?? `#${b.attribute_id}`)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">{a?.type}</span>
                                                        {b.is_required && (
                                                            <Badge variant="secondary" className="text-[10px]">
                                                                req
                                                            </Badge>
                                                        )}
                                                        {b.is_filterable && (
                                                            <Badge variant="secondary" className="text-[10px]">
                                                                filter
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {b.applies_to}
                                                        </Badge>
                                                        {a && a.category_slug !== selected?.slug && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                из «{a.category_slug}»
                                                            </span>
                                                        )}
                                                        <div className="ml-auto flex items-center gap-0.5">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => setBindDialog({ open: true, binding: b })}
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-destructive"
                                                                onClick={() => deleteBinding.mutate(b.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </section>

                                {/* effective (inherited) */}
                                <section className="space-y-2">
                                    <h3 className="text-sm font-semibold">
                                        Эффективный набор (с наследованием)
                                    </h3>
                                    {(effective ?? []).length === 0 ? (
                                        <div className="text-sm text-muted-foreground">Пусто</div>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {(effective ?? []).map((a) => (
                                                <Badge key={a.attribute_id} variant="outline" className="font-normal">
                                                    {pickLabel(a.label, a.key)}
                                                    {a.is_required ? ' *' : ''}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {catDialog.open && (
                <CategoryDialog
                    open={catDialog.open}
                    onOpenChange={(v) => setCatDialog((s) => ({ ...s, open: v }))}
                    category={catDialog.category}
                    parent={catDialog.parent}
                />
            )}
            {groupDialog.open && selectedId != null && (
                <GroupDialog
                    open={groupDialog.open}
                    onOpenChange={(v) => setGroupDialog((st) => ({ ...st, open: v }))}
                    categoryId={selectedId!}
                    group={groupDialog.group}
                />
            )}
            {selectedId != null && bindDialog.open && (
                <BindingDialog
                    open={bindDialog.open}
                    onOpenChange={(v) => setBindDialog((s) => ({ ...s, open: v }))}
                    categoryId={selectedId}
                    binding={bindDialog.binding}
                    attributes={attributes ?? []}
                    groups={bindingGroups}
                    dealTypes={
                        (effective ?? []).find((a) => a.key === 'deal_type')?.options ?? []
                    }
                    effective={effective ?? []}
                    ownerPaths={selected ? selected.path.split('.') : undefined}
                />
            )}
        </div>
    )
}
