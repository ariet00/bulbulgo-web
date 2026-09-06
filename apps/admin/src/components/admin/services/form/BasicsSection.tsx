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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@doska/ui'
import { LocalizedInputs } from '../LocalizedInputs'
import { IconColorInput } from '../IconColorInput'
import { SERVICE_ICON_GLYPHS, SERVICE_ICONS } from '../ServiceIcon'
import { NO_BADGE, type ServiceFormValues } from './schema'

/** Что за сервис: идентичность, тексты и оформление значка. */
export function BasicsSection({
    form,
    isEdit,
}: {
    form: UseFormReturn<ServiceFormValues>
    isEdit: boolean
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Основное</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="my_service"
                                        disabled={isEdit}
                                    />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                    {isEdit
                                        ? 'После создания не меняется — на него завязаны клиенты'
                                        : 'Латиница, цифры и «_», начиная с буквы'}
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Тип</FormLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isEdit}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="webview">
                                            Webview
                                        </SelectItem>
                                        <SelectItem value="native">
                                            Нативный
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Webview добавляется без релиза приложения;
                                    нативный — экран, уже зашитый в сборку
                                </p>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                        <FormItem>
                            <LocalizedInputs
                                value={field.value}
                                onChange={field.onChange}
                                label="Название"
                            />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <LocalizedInputs
                                value={field.value}
                                onChange={field.onChange}
                                label="Описание"
                            />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Иконка</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="https://… или имя значка (пусто — иконка из приложения)"
                                />
                            </FormControl>
                            <div className="flex flex-wrap gap-1">
                                {SERVICE_ICONS.map((name) => {
                                    const Glyph = SERVICE_ICON_GLYPHS[name]
                                    const active = field.value === name
                                    return (
                                        <button
                                            key={name}
                                            type="button"
                                            title={name}
                                            onClick={() =>
                                                field.onChange(
                                                    active ? '' : name,
                                                )
                                            }
                                            className={`flex size-8 items-center justify-center rounded-md border transition-colors ${
                                                active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted'
                                            }`}
                                        >
                                            <Glyph className="size-4" />
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Значок по имени рисует само приложение — хостить
                                картинку не нужно (набор здесь показан
                                ближайшими аналогами). Своя картинка задаётся
                                полным URL.
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <IconColorInput
                                value={field.value}
                                onChange={field.onChange}
                            />
                            <p className="text-xs text-muted-foreground">
                                «Главная» сейчас рисует значки одним акцентным
                                цветом — это поле на неё не влияет.
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="badge"
                    render={({ field }) => (
                        <FormItem className="sm:max-w-[220px]">
                            <FormLabel>Бейдж</FormLabel>
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
                                    <SelectItem value={NO_BADGE}>
                                        Без бейджа
                                    </SelectItem>
                                    <SelectItem value="new">NEW</SelectItem>
                                    <SelectItem value="soon">СКОРО</SelectItem>
                                    <SelectItem value="hit">ХИТ</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Карточка «Главной» рисует только NEW
                                (service_card.dart); «СКОРО» и «ХИТ» она
                                игнорирует — их видно лишь там, где приложение
                                само их поддерживает.
                            </p>
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
}
