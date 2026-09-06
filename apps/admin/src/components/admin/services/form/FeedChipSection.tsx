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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@doska/ui'
import type { AdminService } from '@/apis/admin'
import { FEED_TEMPLATE_LABELS, FEED_TEMPLATES } from '@/apis/admin'
import {
    NO_FEED_SERVICE,
    NO_TEMPLATE,
    type ServiceFormValues,
} from './schema'

/** Чип ленты «Главной» (ребёнок home_feed): куда ведёт блок под чипом и каким
 *  шаблоном он нарисован. У обычной карточки этих полей нет. */
export function FeedChipSection({
    form,
    targets,
}: {
    form: UseFormReturn<ServiceFormValues>
    targets: AdminService[]
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Блок ленты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="feed_service"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Сервис блока</FormLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={NO_FEED_SERVICE}>
                                        Не выбран
                                    </SelectItem>
                                    {targets.map((s) => (
                                        <SelectItem key={s.slug} value={s.slug}>
                                            {s.label?.ru ?? s.slug}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Куда ведёт блок под чипом: нативный продукт
                                открывается своим экраном, webview-сервис —
                                вебвью.
                            </p>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="template"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Шаблон блока</FormLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={NO_TEMPLATE}>
                                        Без шаблона — блок вшит в приложение
                                    </SelectItem>
                                    {FEED_TEMPLATES.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {FEED_TEMPLATE_LABELS[t]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                С шаблоном чип появляется в ленте без релиза
                                приложения: шапка блока — название, описание и
                                значок самого чипа, а список под ней бэк отдаёт
                                по слагу сервиса. Без шаблона контент берётся из
                                приложения по slug&apos;у чипа (попутки,
                                недвижимость, грузовые, авторынок) — незнакомый
                                slug приложение пропустит.
                            </p>
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
}
