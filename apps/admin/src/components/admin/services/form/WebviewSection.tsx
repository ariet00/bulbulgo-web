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
    FormMessage,
    Input,
    Switch,
} from '@doska/ui'
import { NavItemsSection } from './NavItemsSection'
import type { ServiceFormValues } from './schema'

/** Как открывается webview-сервис: адрес, вход и оформление шапки. */
export function WebviewSection({
    form,
}: {
    form: UseFormReturn<ServiceFormValues>
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Webview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL страницы</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="https://example.com/service"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="auth"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <FormLabel>Авторизация</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                    Открывать с одноразовым кодом входа (?code=…)
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="app_bar"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <FormLabel>Нативная шапка</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                    Выкл — страница рисует свой заголовок и
                                    кнопку закрытия сама (мостовой close)
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <NavItemsSection form={form} />
            </CardContent>
        </Card>
    )
}
