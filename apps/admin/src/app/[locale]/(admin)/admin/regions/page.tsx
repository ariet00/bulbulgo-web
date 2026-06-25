'use client'

import { useMemo, useState } from 'react'
import { useAdminRegions } from '@/hooks/queries/admin'
import type { AdminRegion } from '@/apis/admin'
import { useDebounce } from '@doska/shared'
import {
    Badge,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@doska/ui'
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react'

// Порядок уровней дерева: страна → область → район → аймак → город → село → внутригородские
const KIND_ORDER: Record<string, number> = {
    country: 0,
    region: 1,
    district: 2,
    ayil_aimak: 3,
    city: 4,
    near_city: 4,
    village: 5,
    incity: 6,
}

const KIND_LABEL: Record<string, string> = {
    country: 'страна',
    region: 'область',
    district: 'район',
    ayil_aimak: 'аймак',
    city: 'город',
    near_city: 'пригород',
    village: 'село',
    incity: 'внутри города',
}

const ALL_KINDS = 'all'
// Порядок опций фильтра = порядок уровней дерева
const KIND_OPTIONS = ['region', 'district', 'ayil_aimak', 'city', 'near_city', 'village', 'incity']

function normalize(s: string) {
    return s.toLowerCase().replace(/ё/g, 'е')
}

export default function AdminRegionsPage() {
    const { data: regions, isLoading, isError } = useAdminRegions()
    const [search, setSearch] = useState('')
    const q = useDebounce(search, 250)
    const [kind, setKind] = useState<string>(ALL_KINDS)
    const [expanded, setExpanded] = useState<Set<number>>(new Set())

    const { childrenByParent, byId, roots } = useMemo(() => {
        const list = regions ?? []
        const byId = new Map<number, AdminRegion>()
        const childrenByParent = new Map<number | null, AdminRegion[]>()
        for (const r of list) byId.set(r.id, r)
        for (const r of list) {
            // корень — если нет родителя или родителя нет в наборе
            const pid = r.parent_id != null && byId.has(r.parent_id) ? r.parent_id : null
            const arr = childrenByParent.get(pid) ?? []
            arr.push(r)
            childrenByParent.set(pid, arr)
        }
        const sortFn = (a: AdminRegion, b: AdminRegion) => {
            const ka = KIND_ORDER[a.kind ?? ''] ?? 99
            const kb = KIND_ORDER[b.kind ?? ''] ?? 99
            if (ka !== kb) return ka - kb
            return a.name.localeCompare(b.name, 'ru')
        }
        for (const arr of childrenByParent.values()) arr.sort(sortFn)
        const roots = (childrenByParent.get(null) ?? []).slice()
        return { childrenByParent, byId, roots }
    }, [regions])

    // Фильтр (текст + тип): подсветить совпадения и раскрыть их предков
    const { matched, forcedExpanded, visible } = useMemo(() => {
        const qActive = !!q && q.trim().length >= 2
        const kindActive = kind !== ALL_KINDS
        if (!qActive && !kindActive) {
            return { matched: null as Set<number> | null, forcedExpanded: null as Set<number> | null, visible: null as Set<number> | null }
        }
        const nq = qActive ? normalize(q.trim()) : ''
        const list = regions ?? []
        const matched = new Set<number>()
        for (const r of list) {
            const textOk =
                !qActive ||
                normalize(r.name).includes(nq) ||
                (r.sub_name ? normalize(r.sub_name).includes(nq) : false)
            const kindOk = !kindActive || r.kind === kind
            if (textOk && kindOk) matched.add(r.id)
        }
        // предки совпадений → видимы и раскрыты
        const forcedExpanded = new Set<number>()
        const visible = new Set<number>(matched)
        for (const id of matched) {
            let cur = byId.get(id)?.parent_id ?? null
            while (cur != null && byId.has(cur)) {
                forcedExpanded.add(cur)
                visible.add(cur)
                cur = byId.get(cur)?.parent_id ?? null
            }
        }
        return { matched, forcedExpanded, visible }
    }, [q, kind, regions, byId])

    const toggle = (id: number) =>
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })

    const isExpanded = (id: number) =>
        forcedExpanded ? forcedExpanded.has(id) : expanded.has(id)

    const renderNode = (node: AdminRegion, depth: number): React.ReactNode => {
        if (visible && !visible.has(node.id)) return null
        const children = childrenByParent.get(node.id) ?? []
        const hasChildren = children.length > 0
        const open = isExpanded(node.id)
        const isMatch = matched?.has(node.id)
        const hasCoords = node.latitude != null && node.longitude != null

        return (
            <div key={node.id}>
                <div
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60"
                    style={{ paddingLeft: depth * 18 + 8 }}
                >
                    {hasChildren ? (
                        <button
                            onClick={() => toggle(node.id)}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-muted"
                            aria-label={open ? 'Свернуть' : 'Развернуть'}
                        >
                            {open ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </button>
                    ) : (
                        <span className="inline-block h-5 w-5 shrink-0" />
                    )}

                    <span className={isMatch ? 'font-semibold text-primary' : ''}>{node.name}</span>

                    {node.kind && (
                        <Badge variant="secondary" className="text-[10px]">
                            {KIND_LABEL[node.kind] ?? node.kind}
                        </Badge>
                    )}

                    {hasCoords && (
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" aria-label="есть координаты" />
                    )}

                    {hasChildren && (
                        <span className="text-xs text-muted-foreground">{children.length}</span>
                    )}

                    {node.sub_name && (
                        <span className="ml-auto truncate text-xs text-muted-foreground">
                            {node.sub_name}
                        </span>
                    )}
                </div>

                {hasChildren && open && (
                    <div>{children.map((c) => renderNode(c, depth + 1))}</div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4 p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" /> Регионы
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            placeholder="Поиск по названию или описанию…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-md"
                        />
                        <Select value={kind} onValueChange={setKind}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Тип" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_KINDS}>Все типы</SelectItem>
                                {KIND_OPTIONS.map((k) => (
                                    <SelectItem key={k} value={k}>
                                        {KIND_LABEL[k]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-xs text-muted-foreground">
                        {regions ? `Всего: ${regions.length}` : ''}
                        {matched ? ` · найдено: ${matched.size}` : ''}
                    </div>

                    {isLoading && <div className="py-8 text-center text-muted-foreground">Загрузка…</div>}
                    {isError && <div className="py-8 text-center text-destructive">Ошибка загрузки</div>}

                    {!isLoading && !isError && (
                        <div className="max-h-[70vh] overflow-y-auto rounded-md border text-sm">
                            {roots.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">Пусто</div>
                            ) : matched && matched.size === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">Ничего не найдено</div>
                            ) : (
                                roots.map((r) => renderNode(r, 0))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
