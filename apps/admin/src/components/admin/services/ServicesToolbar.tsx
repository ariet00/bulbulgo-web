'use client'

import {
    Button,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@doska/ui'
import { Search, X } from 'lucide-react'
import type { AdminService, PlacementKind } from '@/apis/admin'
import { servicePlacements } from '@/apis/admin'

export interface ServiceFilters {
    q: string
    type: 'all' | 'native' | 'webview'
    placement: 'all' | PlacementKind
    status: 'all' | 'on' | 'off'
}

export const EMPTY_FILTERS: ServiceFilters = {
    q: '',
    type: 'all',
    placement: 'all',
    status: 'all',
}

/** Список отфильтрован — драг в этот момент запрещён: перетаскивать имеет
 *  смысл только полный порядок уровня. */
export const isFiltered = (f: ServiceFilters) =>
    !!f.q.trim() ||
    f.type !== 'all' ||
    f.placement !== 'all' ||
    f.status !== 'all'

const PLACEMENT_OPTIONS: { value: ServiceFilters['placement']; label: string }[] = [
    { value: 'all', label: 'Любое размещение' },
    { value: 'home', label: 'На «Главной»' },
    { value: 'tab', label: 'В табах' },
    { value: 'child', label: 'Внутри раздела' },
    { value: 'feed_chip', label: 'Чипы ленты' },
    { value: 'hidden', label: 'Скрытые' },
]

export function matchesFilters(s: AdminService, f: ServiceFilters): boolean {
    const q = f.q.trim().toLowerCase()
    if (q) {
        const haystack = [s.slug, ...Object.values(s.label ?? {})]
            .join(' ')
            .toLowerCase()
        if (!haystack.includes(q)) return false
    }
    if (f.type !== 'all' && s.type !== f.type) return false
    if (f.status !== 'all' && s.enabled !== (f.status === 'on')) return false
    if (
        f.placement !== 'all' &&
        !servicePlacements(s).some((p) => p.kind === f.placement)
    ) {
        return false
    }
    return true
}

export function ServicesToolbar({
    value,
    onChange,
    shown,
    total,
}: {
    value: ServiceFilters
    onChange: (next: ServiceFilters) => void
    shown: number
    total: number
}) {
    const set = <K extends keyof ServiceFilters>(
        key: K,
        v: ServiceFilters[K],
    ) => onChange({ ...value, [key]: v })

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={value.q}
                    onChange={(e) => set('q', e.target.value)}
                    placeholder="Название или slug…"
                    className="pl-8"
                />
            </div>

            <Select
                value={value.type}
                onValueChange={(v) => set('type', v as ServiceFilters['type'])}
            >
                <SelectTrigger className="w-[150px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Любой тип</SelectItem>
                    <SelectItem value="native">Нативные</SelectItem>
                    <SelectItem value="webview">Webview</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={value.placement}
                onValueChange={(v) =>
                    set('placement', v as ServiceFilters['placement'])
                }
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {PLACEMENT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                            {o.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={value.status}
                onValueChange={(v) => set('status', v as ServiceFilters['status'])}
            >
                <SelectTrigger className="w-[150px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="on">Включённые</SelectItem>
                    <SelectItem value="off">Выключенные</SelectItem>
                </SelectContent>
            </Select>

            {isFiltered(value) && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(EMPTY_FILTERS)}
                >
                    <X className="size-4 mr-1" /> Сбросить
                </Button>
            )}

            <span className="text-xs text-muted-foreground">
                {shown} из {total}
            </span>
        </div>
    )
}
