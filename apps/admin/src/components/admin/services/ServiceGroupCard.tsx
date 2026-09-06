'use client'

import { useState } from 'react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
} from '@doska/ui'
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminService, AdminServiceGroup } from '@/apis/admin'
import {
    useAdminDeleteServiceGroup,
    useAdminSetServiceGroupItems,
    useAdminUpdateServiceGroup,
} from '@/hooks/mutations/admin'
import { useConfirm } from '@/components/admin/ConfirmProvider'
import { LocalizedInputs } from './LocalizedInputs'

const ADD_PLACEHOLDER = '__add__'

/** Мультиязычные тексты равны, если совпали по всем заполненным локалям. */
const sameText = (a: Record<string, string> = {}, b: Record<string, string> = {}) =>
    [...new Set([...Object.keys(a), ...Object.keys(b)])].every(
        (k) => (a[k] ?? '') === (b[k] ?? ''),
    )

/**
 * Карточка группы: заголовок, видимость, позиция секции и её состав.
 *
 * Группа у сервиса одна и выбирается в его карточке; здесь — порядок внутри
 * группы. Добавленный сюда чужой сервис переезжает из прежней группы, поэтому
 * такой перенос спрашивается заранее.
 */
export function ServiceGroupCard({
    group,
    services,
}: {
    group: AdminServiceGroup
    services: AdminService[]
}) {
    const [label, setLabel] = useState(group.label ?? {})
    const [icon, setIcon] = useState(group.icon ?? '')
    const [position, setPosition] = useState(group.position)

    const updateMutation = useAdminUpdateServiceGroup()
    const deleteMutation = useAdminDeleteServiceGroup()
    const itemsMutation = useAdminSetServiceGroupItems()
    const confirm = useConfirm()

    const bySlug = new Map(services.map((s) => [s.slug, s]))
    const title = (slug: string) => bySlug.get(slug)?.label?.ru ?? slug
    // Группа — секция «Главной»: дочерние сервисы и чипы ленты в неё не кладут.
    const available = services.filter(
        (s) => !s.parent_slug && !group.services.includes(s.slug),
    )

    // Видимость сохраняется сразу, а тексты и позиция — по кнопке: она и
    // должна показывать, есть ли что сохранять.
    const dirty =
        !sameText(label, group.label ?? {}) ||
        (icon.trim() || null) !== (group.icon ?? null) ||
        position !== group.position

    const saveItems = (next: string[]) =>
        itemsMutation.mutate({ id: group.id, services: next })

    const move = (index: number, delta: number) => {
        const next = [...group.services]
        const target = index + delta
        if (target < 0 || target >= next.length) return
        ;[next[index], next[target]] = [next[target], next[index]]
        saveItems(next)
    }

    const remove = (slug: string) =>
        saveItems(group.services.filter((s) => s !== slug))

    const add = async (slug: string) => {
        // Сервис лежит ровно в одной группе: добавление чужого — это перенос.
        const from = bySlug.get(slug)?.group
        if (from && from !== group.slug) {
            const ok = await confirm(
                `«${title(slug)}» сейчас в группе «${from}». Перенести сюда?`,
            )
            if (!ok) return
        }
        saveItems([...group.services, slug])
    }

    const handleDelete = async () => {
        // Бэк запрещает удалять непустую группу (FK на CASCADE — иначе её
        // сервисы молча уехали бы в «Другое»); подсказываем это до запроса.
        if (group.services.length) {
            toast.info(
                `В группе ещё ${group.services.length} сервис(ов) — сначала уберите их из состава.`,
            )
            return
        }
        if (await confirm(`Удалить группу «${label.ru ?? group.slug}»?`)) {
            deleteMutation.mutate(group.id)
        }
    }

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="flex items-center gap-2">
                    {label.ru || group.slug}
                    <Badge variant="outline" className="font-mono text-xs">
                        {group.slug}
                    </Badge>
                    {!group.enabled && <Badge variant="secondary">Скрыта</Badge>}
                </CardTitle>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Видна</span>
                        <Switch
                            checked={group.enabled}
                            onCheckedChange={(enabled) =>
                                updateMutation.mutate({
                                    id: group.id,
                                    body: { enabled },
                                })
                            }
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                    >
                        <Trash2 className="size-4 text-destructive" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <LocalizedInputs
                    value={label}
                    onChange={setLabel}
                    label="Заголовок секции"
                />
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label>Иконка (URL)</Label>
                        <Input
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Позиция секции</Label>
                        <Input
                            type="number"
                            value={position}
                            onChange={(e) => setPosition(Number(e.target.value))}
                        />
                    </div>
                </div>
                <Button
                    size="sm"
                    variant="secondary"
                    disabled={updateMutation.isPending || !dirty}
                    onClick={() =>
                        updateMutation.mutate({
                            id: group.id,
                            body: { label, icon: icon.trim() || null, position },
                        })
                    }
                >
                    {dirty ? 'Сохранить группу' : 'Сохранено'}
                </Button>

                <div className="space-y-2">
                    <Label>Состав ({group.services.length})</Label>
                    {group.services.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Пусто — секция не покажется на «Главной».
                        </p>
                    )}
                    <ul className="space-y-1">
                        {group.services.map((slug, index) => (
                            <li
                                key={slug}
                                className="flex items-center gap-2 rounded-md border px-2 py-1.5"
                            >
                                <span className="w-6 text-xs text-muted-foreground">
                                    {index + 1}
                                </span>
                                <span className="flex-1 text-sm">{title(slug)}</span>
                                <span className="font-mono text-xs text-muted-foreground">
                                    {slug}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={index === 0 || itemsMutation.isPending}
                                    onClick={() => move(index, -1)}
                                >
                                    <ArrowUp className="size-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={
                                        index === group.services.length - 1 ||
                                        itemsMutation.isPending
                                    }
                                    onClick={() => move(index, 1)}
                                >
                                    <ArrowDown className="size-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={itemsMutation.isPending}
                                    onClick={() => remove(slug)}
                                >
                                    <X className="size-4 text-destructive" />
                                </Button>
                            </li>
                        ))}
                    </ul>

                    {available.length > 0 && (
                        <Select
                            value={ADD_PLACEHOLDER}
                            onValueChange={(slug) => {
                                if (slug !== ADD_PLACEHOLDER) add(slug)
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ADD_PLACEHOLDER}>
                                    Добавить сервис…
                                </SelectItem>
                                {available.map((s) => (
                                    <SelectItem key={s.slug} value={s.slug}>
                                        {s.label?.ru ?? s.slug}
                                        {!s.enabled && ' (выключен)'}
                                        {s.group && s.group !== group.slug
                                            ? ` · из «${s.group}»`
                                            : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

/** Форма создания группы — slug задаётся один раз и дальше не меняется. */
export function ServiceGroupCreate({
    onCreate,
    submitting,
}: {
    onCreate: (body: { slug: string; label: Record<string, string>; position: number }) => void
    submitting: boolean
}) {
    const [slug, setSlug] = useState('')
    const [label, setLabel] = useState<Record<string, string>>({})
    const [position, setPosition] = useState(0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Новая группа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label>Slug</Label>
                        <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="transport"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Позиция</Label>
                        <Input
                            type="number"
                            value={position}
                            onChange={(e) => setPosition(Number(e.target.value))}
                        />
                    </div>
                </div>
                <LocalizedInputs
                    value={label}
                    onChange={setLabel}
                    label="Заголовок секции"
                />
                <Button
                    size="sm"
                    disabled={!slug.trim() || submitting}
                    onClick={() => {
                        onCreate({ slug: slug.trim(), label, position })
                        setSlug('')
                        setLabel({})
                    }}
                >
                    <Plus className="size-4 mr-1" /> Создать
                </Button>
            </CardContent>
        </Card>
    )
}
