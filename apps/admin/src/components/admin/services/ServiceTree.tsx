'use client'

import { Fragment, useMemo, useState } from 'react'
import { Skeleton } from '@doska/ui'
import type { AdminService } from '@/apis/admin'
import {
    useAdminDeleteService,
    useAdminReorderServices,
    useAdminUpdateService,
} from '@/hooks/mutations/admin'
import { useConfirm } from '@/components/admin/ConfirmProvider'
import { ServiceTreeRow, serviceTitle } from './ServiceTreeRow'
import {
    EMPTY_FILTERS,
    isFiltered,
    matchesFilters,
    ServicesToolbar,
    type ServiceFilters,
} from './ServicesToolbar'
import { useDragList } from './useDragList'

/** Тот же порядок, что отдаёт бэк (position, затем id). */
const byPosition = (a: AdminService, b: AdminService) =>
    a.position - b.position || a.id - b.id

/**
 * Дерево сервисов: корневые карточки «Главной» в порядке position, под ними —
 * дети раздела и чипы ленты. Драг внутри уровня сохраняет порядок сразу.
 */
export function ServiceTree({
    services,
    isLoading,
}: {
    services: AdminService[] | undefined
    isLoading: boolean
}) {
    const [filters, setFilters] = useState<ServiceFilters>(EMPTY_FILTERS)
    const [expanded, setExpanded] = useState<Set<string>>(new Set())

    const rows = services ?? []
    const filtered = isFiltered(filters)

    const { roots, childrenOf } = useMemo(() => {
        const sorted = [...rows].sort(byPosition)
        const children = new Map<string, AdminService[]>()
        for (const s of sorted) {
            if (!s.parent_slug) continue
            const list = children.get(s.parent_slug) ?? []
            list.push(s)
            children.set(s.parent_slug, list)
        }
        return {
            roots: sorted.filter((s) => !s.parent_slug),
            childrenOf: (slug: string) => children.get(slug) ?? [],
        }
    }, [rows])

    // При активном фильтре родитель остаётся как контекст для найденного
    // ребёнка, а совпавшие ветки раскрываются сами.
    const match = (s: AdminService) => matchesFilters(s, filters)
    const visibleChildren = (slug: string) =>
        filtered ? childrenOf(slug).filter(match) : childrenOf(slug)
    const visibleRoots = filtered
        ? roots.filter((r) => match(r) || visibleChildren(r.slug).length > 0)
        : roots

    const shown =
        visibleRoots.length +
        visibleRoots.reduce((n, r) => n + visibleChildren(r.slug).length, 0)

    // Под фильтром ветку с найденными детьми раскрываем сами — иначе
    // совпадение пряталось бы в свёрнутой строке.
    const isExpanded = (slug: string) =>
        filtered ? visibleChildren(slug).length > 0 : expanded.has(slug)

    const toggleExpanded = (slug: string) =>
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(slug)) next.delete(slug)
            else next.add(slug)
            return next
        })

    return (
        <div className="space-y-3">
            <ServicesToolbar
                value={filters}
                onChange={setFilters}
                shown={shown}
                total={rows.length}
            />

            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            ) : shown === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    {rows.length === 0
                        ? 'Сервисов пока нет'
                        : 'Ничего не нашлось — измените фильтры'}
                </p>
            ) : (
                <ServiceLevel
                    items={visibleRoots}
                    childrenOf={visibleChildren}
                    isExpanded={isExpanded}
                    onToggleExpanded={toggleExpanded}
                    dragEnabled={!filtered}
                />
            )}
        </div>
    )
}

/** Один уровень дерева: свой драг-порядок и, для раскрытых строк, вложенный
 *  уровень детей. Глубина у сервисов одна, но код от неё не зависит. */
function ServiceLevel({
    items,
    childrenOf,
    isExpanded,
    onToggleExpanded,
    dragEnabled,
    depth = 0,
}: {
    items: AdminService[]
    childrenOf: (slug: string) => AdminService[]
    isExpanded: (slug: string) => boolean
    onToggleExpanded: (slug: string) => void
    dragEnabled: boolean
    depth?: number
}) {
    const reorder = useAdminReorderServices()
    const updateService = useAdminUpdateService({ silent: true })
    const deleteService = useAdminDeleteService()
    const confirm = useConfirm()

    const order = items.map((s) => s.slug)
    const { dragging, over, itemProps } = useDragList(
        order,
        (next) => reorder.mutate(next),
        dragEnabled && items.length > 1,
    )

    const handleDelete = async (s: AdminService) => {
        if (await confirm(`Удалить сервис «${serviceTitle(s)}»?`)) {
            deleteService.mutate(s.id)
        }
    }

    return (
        <div className="space-y-1">
            {items.map((s) => {
                const kids = childrenOf(s.slug)
                const isOpen = isExpanded(s.slug)
                return (
                    <Fragment key={s.id}>
                        <ServiceTreeRow
                            service={s}
                            depth={depth}
                            childCount={kids.length}
                            expanded={isOpen}
                            onToggleExpanded={() => onToggleExpanded(s.slug)}
                            onToggleEnabled={(enabled) =>
                                updateService.mutate({
                                    id: s.id,
                                    body: { enabled },
                                })
                            }
                            onDelete={() => handleDelete(s)}
                            rowProps={itemProps(s.slug).row}
                            handleProps={itemProps(s.slug).handle}
                            dragging={dragging === s.slug}
                            over={over === s.slug}
                            dragEnabled={dragEnabled && items.length > 1}
                        />
                        {isOpen && kids.length > 0 && (
                            <ServiceLevel
                                items={kids}
                                childrenOf={childrenOf}
                                isExpanded={isExpanded}
                                onToggleExpanded={onToggleExpanded}
                                dragEnabled={dragEnabled}
                                depth={depth + 1}
                            />
                        )}
                    </Fragment>
                )
            })}
        </div>
    )
}
