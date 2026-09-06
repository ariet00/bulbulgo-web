'use client'

import type { UseFormReturn } from 'react-hook-form'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    Input,
} from '@doska/ui'
import { useAdminMarketplaceRoots } from '@/hooks/queries/admin'
import type { ServiceFormValues } from './schema'

/** Связка сервиса с корнем каталога маркетплейса — для native и webview
 *  одинаково (недвижимость → real_estate, webview-авторынок → auto). Слаг
 *  сервиса и слаг категории — из разных пространств имён, поэтому связка
 *  явная (apps/marketplace/deps.py читает её по заголовку X-Service-Slug). */
export function MarketplaceSection({
    form,
}: {
    form: UseFormReturn<ServiceFormValues>
}) {
    const { data: categories } = useAdminMarketplaceRoots()
    const roots = categories ?? []

    return (
        <Card>
            <CardHeader>
                <CardTitle>Каталог маркетплейса</CardTitle>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="marketplace_root"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Корневая категория</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="real_estate — пусто, если сервис не про каталог"
                                />
                            </FormControl>
                            {roots.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {roots.map((c) => {
                                        const active = field.value === c.slug
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() =>
                                                    field.onChange(
                                                        active ? '' : c.slug,
                                                    )
                                                }
                                                className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
                                                    active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'hover:bg-muted'
                                                }`}
                                            >
                                                {c.label?.ru ?? c.slug}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Экран берёт по ней объявления и атрибуты.
                                Неизвестный слаг бэк отдаст 400 при запросе
                                каталога.
                            </p>
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
}
