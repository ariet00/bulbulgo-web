'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    Badge,
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
} from '@doska/ui'
import { X } from 'lucide-react'
import type { AdminRegion } from '@/apis/admin'
import { useCreateAdminRegion, useUpdateAdminRegion } from '@/hooks/mutations/admin'

// Порядок уровней дерева: страна → область → район → аймак → город → село → внутригородские
export const KIND_ORDER: Record<string, number> = {
    country: 0,
    region: 1,
    district: 2,
    ayil_aimak: 3,
    city: 4,
    near_city: 4,
    village: 5,
    incity: 6,
}

export const KIND_LABEL: Record<string, string> = {
    country: 'страна',
    region: 'область',
    district: 'район',
    ayil_aimak: 'аймак',
    city: 'город',
    near_city: 'пригород',
    village: 'село',
    incity: 'внутри города',
}

// Порядок опций = порядок уровней дерева (country не предлагаем)
export const KIND_OPTIONS = ['region', 'district', 'ayil_aimak', 'city', 'near_city', 'village', 'incity']

const NO_KIND = 'none'

function normalize(s: string) {
    return s.toLowerCase().replace(/ё/g, 'е')
}

type ParentPickerProps = {
    regions: AdminRegion[]
    value: number | null
    onChange: (id: number | null) => void
}

/** Компактный поиск-селектор родителя по уже загруженному дереву. */
function ParentPicker({ regions, value, onChange }: ParentPickerProps) {
    const [q, setQ] = useState('')
    const selected = useMemo(
        () => (value != null ? regions.find((r) => r.id === value) ?? null : null),
        [regions, value],
    )
    const matches = useMemo(() => {
        const nq = normalize(q.trim())
        if (nq.length < 2) return []
        // Ранг: имя-префикс < имя-подстрока < search-ключи < только sub_name —
        // иначе сам «Бишкек г.» вытесняется из топ-15 сотнями его районов
        // с «Бишкек» в sub_name.
        const ranked: { r: AdminRegion; rank: number }[] = []
        for (const r of regions) {
            if (r.id === value) continue
            const name = normalize(r.name)
            let rank: number
            if (name.startsWith(nq)) rank = 0
            else if (name.includes(nq)) rank = 1
            else if (r.search && normalize(r.search).includes(nq)) rank = 2
            else if (r.sub_name && normalize(r.sub_name).includes(nq)) rank = 3
            else continue
            ranked.push({ r, rank })
        }
        ranked.sort((a, b) => {
            if (a.rank !== b.rank) return a.rank - b.rank
            const ka = KIND_ORDER[a.r.kind ?? ''] ?? 99
            const kb = KIND_ORDER[b.r.kind ?? ''] ?? 99
            if (ka !== kb) return ka - kb
            return a.r.name.localeCompare(b.r.name, 'ru')
        })
        return ranked.slice(0, 15).map((x) => x.r)
    }, [q, regions, value])

    return (
        <div className="space-y-1.5">
            <Label>Родитель</Label>
            {selected ? (
                <div className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm">
                    <span>{selected.name}</span>
                    {selected.kind && (
                        <Badge variant="secondary" className="text-[10px]">
                            {KIND_LABEL[selected.kind] ?? selected.kind}
                        </Badge>
                    )}
                    {selected.sub_name && (
                        <span className="truncate text-xs text-muted-foreground">{selected.sub_name}</span>
                    )}
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="ml-auto rounded p-0.5 hover:bg-muted"
                        aria-label="Убрать родителя"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <>
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Поиск региона… (пусто = корень)"
                    />
                    {matches.length > 0 && (
                        <div className="max-h-48 overflow-y-auto rounded-md border text-sm">
                            {matches.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(r.id)
                                        setQ('')
                                    }}
                                    className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-muted/60"
                                >
                                    <span>{r.name}</span>
                                    {r.kind && (
                                        <Badge variant="secondary" className="text-[10px]">
                                            {KIND_LABEL[r.kind] ?? r.kind}
                                        </Badge>
                                    )}
                                    {r.sub_name && (
                                        <span className="ml-auto truncate text-xs text-muted-foreground">
                                            {r.sub_name}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    /** есть → редактирование; нет → создание */
    region?: AdminRegion | null
    /** для создания: родитель по умолчанию (null = корень) */
    parent?: AdminRegion | null
    /** полный набор регионов для выбора родителя */
    regions: AdminRegion[]
}

export function RegionDialog({ open, onOpenChange, region, parent, regions }: Props) {
    const isEdit = !!region
    const [name, setName] = useState('')
    const [kind, setKind] = useState<string>(NO_KIND)
    const [parentId, setParentId] = useState<number | null>(null)
    const [isPopular, setIsPopular] = useState(false)
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [search, setSearch] = useState('')

    const create = useCreateAdminRegion()
    const update = useUpdateAdminRegion()
    const pending = create.isPending || update.isPending

    useEffect(() => {
        if (!open) return
        setName(region?.name ?? '')
        setKind(region?.kind ?? NO_KIND)
        setParentId(region?.parent_id ?? parent?.id ?? null)
        setIsPopular(region?.is_popular ?? false)
        setLatitude(region?.latitude != null ? String(region.latitude) : '')
        setLongitude(region?.longitude != null ? String(region.longitude) : '')
        setSearch(region?.search ?? '')
    }, [open, region, parent])

    const latNum = latitude.trim() === '' ? null : Number(latitude.replace(',', '.'))
    const lngNum = longitude.trim() === '' ? null : Number(longitude.replace(',', '.'))
    const coordsInvalid =
        (latNum != null && Number.isNaN(latNum)) || (lngNum != null && Number.isNaN(lngNum))

    const submit = () => {
        if (!name.trim() || coordsInvalid) return
        const body = {
            name: name.trim(),
            kind: kind === NO_KIND ? null : kind,
            parent_id: parentId,
            is_popular: isPopular,
            latitude: latNum,
            longitude: lngNum,
            search: search.trim() || null,
        }
        if (isEdit) {
            update.mutate({ id: region!.id, body }, { onSuccess: () => onOpenChange(false) })
        } else {
            create.mutate(body, { onSuccess: () => onOpenChange(false) })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Редактировать регион' : 'Новый регион'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Название</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="напр. Аламудунский район"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Тип</Label>
                            <Select value={kind} onValueChange={setKind}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Тип" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NO_KIND}>— не указан —</SelectItem>
                                    {KIND_OPTIONS.map((k) => (
                                        <SelectItem key={k} value={k}>
                                            {KIND_LABEL[k]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end gap-2 pb-2">
                            <Switch checked={isPopular} onCheckedChange={setIsPopular} id="region-popular" />
                            <Label htmlFor="region-popular">Популярный</Label>
                        </div>
                    </div>

                    <ParentPicker regions={regions} value={parentId} onChange={setParentId} />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Широта</Label>
                            <Input
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                placeholder="42.8746"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Долгота</Label>
                            <Input
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                placeholder="74.6122"
                            />
                        </div>
                    </div>
                    {coordsInvalid && (
                        <p className="text-xs text-destructive">Координаты должны быть числами</p>
                    )}

                    <div className="space-y-1.5">
                        <Label>Ключевые слова для поиска</Label>
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="напр. Bishkek Фрунзе"
                        />
                        <p className="text-xs text-muted-foreground">
                            Альтернативные написания и старые названия — регион будет находиться и по ним
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={submit} disabled={pending || !name.trim() || coordsInvalid}>
                        {isEdit ? 'Сохранить' : 'Создать'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
