'use client'

import { useEffect, useState } from 'react'
import {
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
import type { AdminService, LocalizedText } from '@/apis/admin'
import {
    useAdminCreateService,
    useAdminUpdateService,
} from '@/hooks/mutations/admin'

const LANGS = [
    { code: 'ru', name: 'RU' },
    { code: 'ky', name: 'KY' },
    { code: 'en', name: 'EN' },
]

const NO_BADGE = '__none__'

function LocalizedInputs({
    value,
    onChange,
    label,
}: {
    value: LocalizedText
    onChange: (next: LocalizedText) => void
    label: string
}) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            <div className="grid grid-cols-3 gap-2">
                {LANGS.map((l) => (
                    <div key={l.code} className="space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground">
                            {l.name}
                        </span>
                        <Input
                            value={value?.[l.code] ?? ''}
                            onChange={(e) => {
                                const next = { ...(value ?? {}) }
                                if (e.target.value) next[l.code] = e.target.value
                                else delete next[l.code]
                                onChange(next)
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    /** present → edit; absent → create */
    service?: AdminService | null
}

export function ServiceDialog({ open, onOpenChange, service }: Props) {
    const isEdit = !!service
    const [slug, setSlug] = useState('')
    const [type, setType] = useState<'native' | 'webview'>('webview')
    const [label, setLabel] = useState<LocalizedText>({})
    const [description, setDescription] = useState<LocalizedText>({})
    const [icon, setIcon] = useState('')
    const [badge, setBadge] = useState(NO_BADGE)
    const [showInTabs, setShowInTabs] = useState(true)
    const [url, setUrl] = useState('')
    const [auth, setAuth] = useState(false)
    const [enabled, setEnabled] = useState(true)
    const [position, setPosition] = useState(0)

    const create = useAdminCreateService()
    const update = useAdminUpdateService()
    const pending = create.isPending || update.isPending

    useEffect(() => {
        if (!open) return
        setSlug(service?.slug ?? '')
        setType(service?.type ?? 'webview')
        setLabel(service?.label ?? {})
        setDescription(service?.description ?? {})
        setIcon(service?.icon ?? '')
        setBadge(service?.badge ?? NO_BADGE)
        setShowInTabs(service?.show_in_tabs ?? true)
        setUrl(service?.url ?? '')
        setAuth(service?.auth ?? false)
        setEnabled(service?.enabled ?? true)
        setPosition(service?.position ?? 0)
    }, [open, service])

    const submit = () => {
        if (!isEdit && !slug.trim()) return
        if (type === 'webview' && !url.trim()) return

        const common = {
            label,
            description,
            icon: icon.trim() || null,
            badge: badge === NO_BADGE ? null : (badge as 'new' | 'soon'),
            show_in_tabs: showInTabs,
            url: type === 'webview' ? url.trim() : null,
            auth: type === 'webview' ? auth : false,
            enabled,
            position,
        }
        if (isEdit) {
            update.mutate(
                { id: service!.id, body: common },
                { onSuccess: () => onOpenChange(false) },
            )
        } else {
            create.mutate(
                { slug: slug.trim(), type, ...common },
                { onSuccess: () => onOpenChange(false) },
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? `Сервис «${service?.label?.ru ?? service?.slug}»` : 'Новый сервис'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Slug</Label>
                            <Input
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="my_service"
                                disabled={isEdit}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Тип</Label>
                            <Select
                                value={type}
                                onValueChange={(v) => setType(v as 'native' | 'webview')}
                                disabled={isEdit}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="webview">Webview</SelectItem>
                                    <SelectItem value="native">Нативный</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <LocalizedInputs value={label} onChange={setLabel} label="Название" />
                    <LocalizedInputs
                        value={description}
                        onChange={setDescription}
                        label="Описание"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Бейдж</Label>
                            <Select value={badge} onValueChange={setBadge}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NO_BADGE}>Без бейджа</SelectItem>
                                    <SelectItem value="new">NEW</SelectItem>
                                    <SelectItem value="soon">СКОРО</SelectItem>
                                </SelectContent>
                            </Select>
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

                    <div className="space-y-1.5">
                        <Label>Иконка (URL картинки)</Label>
                        <Input
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="https://…  (пусто для нативных — иконка в приложении)"
                        />
                    </div>

                    {type === 'webview' && (
                        <>
                            <div className="space-y-1.5">
                                <Label>URL страницы</Label>
                                <Input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com/service"
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <Label>Авторизация</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Открывать с одноразовым кодом входа (?code=…)
                                    </p>
                                </div>
                                <Switch checked={auth} onCheckedChange={setAuth} />
                            </div>
                        </>
                    )}

                    <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                            <Label>Показывать в табах</Label>
                            <p className="text-xs text-muted-foreground">
                                Выключено — сервис доступен только с «Главной»
                            </p>
                        </div>
                        <Switch checked={showInTabs} onCheckedChange={setShowInTabs} />
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                        <Label>Включён</Label>
                        <Switch checked={enabled} onCheckedChange={setEnabled} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={
                            pending ||
                            (!isEdit && !slug.trim()) ||
                            (type === 'webview' && !url.trim())
                        }
                    >
                        {isEdit ? 'Сохранить' : 'Создать'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
