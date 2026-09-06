'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import type { AdminService } from '@/apis/admin'
import { ServiceIcon } from '../ServiceIcon'
import { PlacementChips } from '../PlacementChips'

/**
 * Как сервис выглядит в приложении. Повторяет ServiceCard (service_card.dart):
 * квадратная плитка со значком по центру, подпись снизу, бейдж «NEW» у самого
 * значка. Описание на «Главной» не показывается — оно идёт в шапку блока
 * ленты и в плитки раздела, поэтому показано отдельной строкой.
 */
export function ServicePreview({ service }: { service: AdminService }) {
    const label = service.label?.ru || Object.values(service.label ?? {})[0]
    const description =
        service.description?.ru || Object.values(service.description ?? {})[0]

    return (
        <Card className="lg:sticky lg:top-4">
            <CardHeader>
                <CardTitle className="text-base">Как это увидят</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-xl border bg-muted/30 p-3">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg bg-background p-2 shadow-sm">
                            <div className="relative">
                                <ServiceIcon
                                    icon={service.icon}
                                    label={label ?? service.slug}
                                    color={service.color}
                                    size="lg"
                                />
                                {service.badge === 'new' && (
                                    <span className="absolute -right-3 -top-1.5 rounded-full bg-primary px-1.5 text-[9px] font-semibold uppercase text-primary-foreground">
                                        new
                                    </span>
                                )}
                            </div>
                            <span className="line-clamp-2 text-center text-[11px] leading-tight">
                                {label || service.slug}
                            </span>
                        </div>
                        {[0, 1].map((i) => (
                            <div
                                key={i}
                                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg bg-background/40 p-2"
                            >
                                <span className="size-12 rounded-lg bg-muted" />
                                <span className="h-2 w-10 rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5 text-sm">
                    <PlacementChips service={service} />
                    {!service.enabled && (
                        <p className="text-xs text-muted-foreground">
                            Выключен — клиенту не выдаётся вовсе.
                        </p>
                    )}
                    {description && (
                        <p className="text-xs text-muted-foreground">
                            Описание «{description}» — только в шапке блока ленты
                            и плитках раздела, на «Главной» его нет.
                        </p>
                    )}
                    {service.type === 'webview' && service.url && (
                        <p className="truncate font-mono text-xs text-muted-foreground">
                            {service.url}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
