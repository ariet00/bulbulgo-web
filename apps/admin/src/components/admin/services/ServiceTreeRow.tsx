'use client'

import type { ReactNode } from 'react'
import { Badge, Button, Switch } from '@doska/ui'
import { Link } from '@doska/i18n'
import {
    ChevronDown,
    ChevronRight,
    GripVertical,
    Globe,
    Pencil,
    Smartphone,
    Trash2,
} from 'lucide-react'
import type { AdminService } from '@/apis/admin'
import { HOME_FEED_PARENT_SLUG } from '@/apis/admin'
import { ServiceIcon } from './ServiceIcon'
import { PlacementChips } from './PlacementChips'

const BADGE_LABELS: Record<string, { text: string; variant: 'default' | 'outline' | 'destructive' }> = {
    new: { text: 'NEW', variant: 'default' },
    soon: { text: 'СКОРО', variant: 'outline' },
    hit: { text: 'ХИТ', variant: 'destructive' },
}

/** Название сервиса для админки: русское, иначе любое заданное, иначе слаг. */
export const serviceTitle = (s: AdminService) =>
    s.label?.ru || Object.values(s.label ?? {})[0] || s.slug

/** Строка дерева: сам сервис плюс всё, что решается прямо из списка —
 *  включение, переход в карточку, удаление. */
export function ServiceTreeRow({
    service,
    depth = 0,
    childCount = 0,
    expanded,
    onToggleExpanded,
    onToggleEnabled,
    onDelete,
    rowProps,
    handleProps,
    dragging,
    over,
    dragEnabled,
}: {
    service: AdminService
    depth?: number
    childCount?: number
    expanded?: boolean
    onToggleExpanded?: () => void
    onToggleEnabled: (enabled: boolean) => void
    onDelete: () => void
    rowProps?: Record<string, unknown>
    handleProps?: Record<string, unknown>
    dragging?: boolean
    over?: boolean
    dragEnabled: boolean
}) {
    const isNative = service.type === 'native'
    const isFeedChip = service.parent_slug === HOME_FEED_PARENT_SLUG
    const badge = service.badge ? BADGE_LABELS[service.badge] : undefined

    return (
        <div
            {...rowProps}
            className={[
                'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border bg-card px-2 py-2 transition-colors',
                dragging ? 'opacity-40' : '',
                over ? 'border-primary' : '',
                service.enabled ? '' : 'opacity-60',
            ].join(' ')}
            style={depth ? { marginLeft: depth * 28 } : undefined}
        >
            <span
                {...handleProps}
                className={
                    dragEnabled
                        ? 'cursor-grab text-muted-foreground active:cursor-grabbing'
                        : 'text-muted-foreground/30'
                }
                title={
                    dragEnabled
                        ? 'Перетащить'
                        : 'Порядок меняется без поиска и фильтров'
                }
            >
                <GripVertical className="size-4" />
            </span>

            {childCount > 0 ? (
                <button
                    type="button"
                    onClick={onToggleExpanded}
                    className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground"
                    title={expanded ? 'Свернуть' : 'Развернуть'}
                >
                    {expanded ? (
                        <ChevronDown className="size-4" />
                    ) : (
                        <ChevronRight className="size-4" />
                    )}
                    <span className="text-xs">{childCount}</span>
                </button>
            ) : (
                <span className="w-[26px]" />
            )}

            <ServiceIcon
                icon={service.icon}
                label={serviceTitle(service)}
                color={service.color}
                size="sm"
            />

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate font-medium">
                        {serviceTitle(service)}
                    </span>
                    {badge && (
                        <Badge variant={badge.variant} className="shrink-0">
                            {badge.text}
                        </Badge>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-muted-foreground">
                    <span>{service.slug}</span>
                    {isFeedChip && (
                        <span title="куда ведёт блок под чипом · шаблон блока">
                            → {service.service ?? '—'} ·{' '}
                            {service.template ?? 'вшит в приложение'}
                        </span>
                    )}
                </div>
            </div>

            <Badge variant="secondary" className="gap-1 font-normal">
                {isNative ? (
                    <Smartphone className="size-3" />
                ) : (
                    <Globe className="size-3" />
                )}
                {isNative ? 'нативный' : 'webview'}
            </Badge>

            <PlacementChips service={service} />

            <span className="w-24 truncate text-xs text-muted-foreground">
                {service.group ?? (service.parent_slug ? '' : 'без группы')}
            </span>

            <Switch
                checked={service.enabled}
                onCheckedChange={onToggleEnabled}
                title={service.enabled ? 'Включён' : 'Выключен'}
            />

            <RowActions service={service} onDelete={onDelete} />
        </div>
    )
}

function RowActions({
    service,
    onDelete,
}: {
    service: AdminService
    onDelete: () => void
}): ReactNode {
    // Нативный сервис зашит в приложение: удалять его нельзя, только выключить.
    const nativeLocked = service.type === 'native'
    return (
        <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" title="Открыть карточку">
                <Link href={`/admin/services/${service.id}`}>
                    <Pencil className="size-4" />
                </Link>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                disabled={nativeLocked}
                onClick={onDelete}
                title={
                    nativeLocked
                        ? 'Нативный сервис зашит в приложение — его можно только выключить'
                        : 'Удалить'
                }
            >
                <Trash2
                    className={
                        nativeLocked ? 'size-4' : 'size-4 text-destructive'
                    }
                />
            </Button>
        </div>
    )
}
