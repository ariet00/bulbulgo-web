'use client'

import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import {
    Button,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@doska/ui'
import { Plus, Trash2 } from 'lucide-react'
import { NAV_ICON_GLYPHS, NAV_ICONS } from '../ServiceIcon'
import type { ServiceFormValues } from './schema'

/** Нижняя навигация webview-сервиса: панель появляется от двух пунктов. */
export function NavItemsSection({
    form,
}: {
    form: UseFormReturn<ServiceFormValues>
}) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'nav_items',
    })

    return (
        <div className="space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between">
                <div>
                    <Label>Нижняя навигация</Label>
                    <p className="text-xs text-muted-foreground">
                        «Страница» грузит URL в вебвью, «Экран» открывает
                        нативный роут приложения. Панель видна от 2 пунктов.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        append({ label: {}, icon: 'home', kind: 'url', value: '' })
                    }
                >
                    <Plus className="size-4" />
                </Button>
            </div>

            {fields.map((row, i) => (
                <div key={row.id} className="space-y-2 rounded-md border p-2">
                    <div className="flex gap-2">
                        <FormField
                            control={form.control}
                            name={`nav_items.${i}.label`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input
                                            placeholder="Название (RU)"
                                            value={field.value?.ru ?? ''}
                                            onChange={(e) =>
                                                field.onChange({
                                                    ...field.value,
                                                    ru: e.target.value,
                                                })
                                            }
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`nav_items.${i}.icon`}
                            render={({ field }) => (
                                <FormItem>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-36">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {NAV_ICONS.map((name) => {
                                                const Glyph =
                                                    NAV_ICON_GLYPHS[name]
                                                return (
                                                    <SelectItem
                                                        key={name}
                                                        value={name}
                                                    >
                                                        <Glyph className="size-4" />
                                                        {name}
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(i)}
                        >
                            <Trash2 className="size-4 text-destructive" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <FormField
                            control={form.control}
                            name={`nav_items.${i}.kind`}
                            render={({ field }) => (
                                <FormItem>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="url">
                                                Страница
                                            </SelectItem>
                                            <SelectItem value="route">
                                                Экран
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`nav_items.${i}.value`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={
                                                form.watch(
                                                    `nav_items.${i}.kind`,
                                                ) === 'route'
                                                    ? '/profile'
                                                    : 'https://…'
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}
