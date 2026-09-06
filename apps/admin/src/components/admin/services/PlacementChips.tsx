'use client'

import { Badge } from '@doska/ui'
import { EyeOff, House, LayoutList, Rows3, Smartphone } from 'lucide-react'
import type { PlacementKind } from '@/apis/admin'
import { servicePlacements, type AdminService } from '@/apis/admin'

const ICONS: Record<PlacementKind, typeof House> = {
    home: House,
    tab: Smartphone,
    child: Rows3,
    feed_chip: LayoutList,
    hidden: EyeOff,
}

const VARIANTS: Record<PlacementKind, 'default' | 'secondary' | 'outline'> = {
    home: 'secondary',
    tab: 'default',
    child: 'outline',
    feed_chip: 'outline',
    hidden: 'outline',
}

/** «Где это видно» одной строкой — разбор полей живёт в servicePlacements. */
export function PlacementChips({ service }: { service: AdminService }) {
    return (
        <div className="flex flex-wrap items-center gap-1">
            {servicePlacements(service).map((p) => {
                const Icon = ICONS[p.kind]
                return (
                    <Badge
                        key={p.kind}
                        variant={VARIANTS[p.kind]}
                        className="gap-1 font-normal"
                    >
                        <Icon className="size-3" />
                        {p.label}
                        {p.hint && (
                            <span className="opacity-70">· {p.hint}</span>
                        )}
                    </Badge>
                )
            })}
        </div>
    )
}
