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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
} from '@doska/ui'
import type { AdminService, AdminServiceGroup } from '@/apis/admin'
import { TAB_SLUGS } from '@/apis/admin'
import {
    canHaveTabValues,
    isChildValues,
    NO_GROUP,
    NO_PARENT,
    type ServiceFormValues,
} from './schema'

/** Где сервис появится: родитель, группа «Главной», табы, видимость. */
export function PlacementSection({
    form,
    parentOptions,
    groups,
}: {
    form: UseFormReturn<ServiceFormValues>
    parentOptions: AdminService[]
    groups: AdminServiceGroup[]
}) {
    const values = form.watch()
    const child = isChildValues(values)
    const tabPossible = canHaveTabValues(values)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Размещение</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="parent"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Родитель</FormLabel>
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
                                        <SelectItem value={NO_PARENT}>
                                            Нет — карточка «Главной»
                                        </SelectItem>
                                        {parentOptions.map((s) => (
                                            <SelectItem
                                                key={s.slug}
                                                value={s.slug}
                                            >
                                                {s.label?.ru ?? s.slug}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    С родителем сервис становится плиткой
                                    раздела и на «Главной» не показывается.
                                </p>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Позиция</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        value={field.value}
                                        onChange={(e) =>
                                            field.onChange(
                                                Number(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                    Обычно проще перетащить строку в списке —
                                    порядок там и есть эти числа.
                                </p>
                            </FormItem>
                        )}
                    />
                </div>

                {!child && (
                    <FormField
                        control={form.control}
                        name="group"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Группа</FormLabel>
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
                                        <SelectItem value={NO_GROUP}>
                                            Без группы
                                        </SelectItem>
                                        {groups.map((g) => (
                                            <SelectItem
                                                key={g.slug}
                                                value={g.slug}
                                            >
                                                {g.label?.ru ?? g.slug}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Группа одна на сервис — выбор новой
                                    переносит его из прежней. На «Главной»
                                    секции сейчас не рисуются: сервисы идут
                                    одной сеткой.
                                </p>
                            </FormItem>
                        )}
                    />
                )}

                {!child &&
                    (tabPossible ? (
                        <FormField
                            control={form.control}
                            name="show_in_tabs"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-md border p-3">
                                    <div>
                                        <FormLabel>Показывать в табах</FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                            Выключено — сервис доступен только с
                                            «Главной»
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
                    ) : (
                        <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                            Таба у этого сервиса быть не может: приложение
                            рисует таб только для нативного сервиса со слагом из
                            набора {TAB_SLUGS.join(', ')} (main_tab.dart).
                            Webview в таб-бар не попадает — поле «в табах»
                            сохранится выключенным.
                        </p>
                    ))}

                <FormField
                    control={form.control}
                    name="hidden"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <FormLabel>Скрыт из списка</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                    Нет ни на «Главной», ни в табах — открывается
                                    только по диплинку или переходу из приложения
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
                    name="enabled"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <FormLabel>Включён</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                    Выключенный сервис не попадает в выдачу
                                    вообще
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
            </CardContent>
        </Card>
    )
}
