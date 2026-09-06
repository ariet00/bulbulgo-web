'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form } from '@doska/ui'
import type { AdminService, AdminServiceCreate } from '@/apis/admin'
import { useAdminServiceGroups, useAdminServices } from '@/hooks/queries/admin'
import { BasicsSection } from './BasicsSection'
import { FeedChipSection } from './FeedChipSection'
import { NativeSection } from './NativeSection'
import { PlacementSection } from './PlacementSection'
import { ServicePreview } from './ServicePreview'
import { WebviewSection } from './WebviewSection'
import {
    defaultValues,
    isFeedChipValues,
    serviceFormSchema,
    toBody,
    toPreview,
    type ServiceFormValues,
} from './schema'

type Props = {
    /** передан → редактирование (slug/type заблокированы); нет → создание */
    initial?: AdminService
    submitLabel: string
    submitting: boolean
    onSubmit: (body: AdminServiceCreate) => void
    /** страница держит на этом свою защиту от ухода с несохранёнными правками */
    onDirtyChange?: (dirty: boolean) => void
}

export function ServiceForm({
    initial,
    submitLabel,
    submitting,
    onSubmit,
    onDirtyChange,
}: Props) {
    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceFormSchema),
        defaultValues: defaultValues(initial),
        mode: 'onBlur',
    })

    const values = form.watch()
    const { isDirty } = form.formState

    const { data: groups } = useAdminServiceGroups()
    const { data: allServices } = useAdminServices()
    // Кандидаты в родители — корневые сервисы (вложенность один уровень),
    // кроме самого редактируемого. Они же и цели блока ленты.
    const roots = (allServices ?? []).filter(
        (s) => !s.parent_slug && s.slug !== initial?.slug,
    )

    useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange])

    // Закрытие вкладки — единственный уход, который админка может перехватить
    // сама; переходы внутри приложения стережёт страница через onDirtyChange.
    useEffect(() => {
        if (!isDirty) return
        const warn = (e: BeforeUnloadEvent) => e.preventDefault()
        window.addEventListener('beforeunload', warn)
        return () => window.removeEventListener('beforeunload', warn)
    }, [isDirty])

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit((v) => onSubmit(toBody(v)))}
                className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]"
            >
                <div className="space-y-6">
                    <BasicsSection form={form} isEdit={!!initial} />
                    <PlacementSection
                        form={form}
                        parentOptions={roots}
                        groups={groups?.groups ?? []}
                    />
                    {isFeedChipValues(values) && (
                        <FeedChipSection form={form} targets={roots} />
                    )}
                    {values.type === 'webview' ? (
                        <WebviewSection form={form} />
                    ) : (
                        <NativeSection form={form} />
                    )}

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={submitting}>
                            {submitLabel}
                        </Button>
                        {isDirty && (
                            <span className="text-xs text-muted-foreground">
                                Есть несохранённые изменения
                            </span>
                        )}
                    </div>
                </div>

                <ServicePreview service={toPreview(values)} />
            </form>
        </Form>
    )
}
