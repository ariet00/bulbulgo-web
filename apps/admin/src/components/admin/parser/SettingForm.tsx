'use client'

import type { ParserSetting } from '@doska/shared'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Textarea,
} from '@doska/ui'
import { AlignLeft, Minimize2 } from 'lucide-react'

export type SettingFormState = {
    group: string
    key: string
    domain: string
    description: string
    dataText: string
}

export const emptySetting: SettingFormState = {
    group: '',
    key: '',
    domain: '',
    description: '',
    dataText: '{}',
}

export function settingFromRow(row: ParserSetting): SettingFormState {
    return {
        group: row.group,
        key: row.key,
        domain: row.domain ?? '',
        description: row.description ?? '',
        dataText: JSON.stringify(row.data, null, 2),
    }
}

export type SettingValidation =
    | { ok: true; body: { group: string; key: string; data: any; domain: string | null; description: string | null } }
    | { ok: false; error: string }

export function validateSetting(s: SettingFormState): SettingValidation {
    if (!s.group.trim()) return { ok: false, error: 'Поле "group" обязательно' }
    if (!s.key.trim()) return { ok: false, error: 'Поле "key" обязательно' }
    let data: any
    try {
        data = JSON.parse(s.dataText)
    } catch (e: any) {
        return { ok: false, error: `Невалидный JSON: ${e?.message ?? e}` }
    }
    return {
        ok: true,
        body: {
            group: s.group.trim(),
            key: s.key.trim(),
            data,
            domain: s.domain.trim() || null,
            description: s.description.trim() || null,
        },
    }
}

type Props = {
    value: SettingFormState
    onChange: (next: SettingFormState) => void
    /** Inline JSON-validation error shown under the data textarea. */
    error: string | null
    onClearError: () => void
}

export function SettingForm({ value: v, onChange, error, onClearError }: Props) {
    const set = (patch: Partial<SettingFormState>) => {
        onClearError()
        onChange({ ...v, ...patch })
    }

    const prettify = () => {
        try {
            const parsed = JSON.parse(v.dataText)
            set({ dataText: JSON.stringify(parsed, null, 2) })
        } catch (e: any) {
            onChange({ ...v })
            // Surface the error via the parent — we can't set it here, but the
            // form's Save will catch it; users can click again after fixing.
        }
    }

    const minify = () => {
        try {
            const parsed = JSON.parse(v.dataText)
            set({ dataText: JSON.stringify(parsed) })
        } catch {
            /* ignore — handled at save time */
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Метаданные</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Group</Label>
                            <Input
                                value={v.group}
                                onChange={(e) => set({ group: e.target.value })}
                                placeholder="parser.ai"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Логическая группа: <code>parser.ai</code>, <code>parser.tg</code>,
                                <code> parser.rules</code>, …
                            </p>
                        </div>
                        <div>
                            <Label>Key</Label>
                            <Input
                                value={v.key}
                                onChange={(e) => set({ key: e.target.value })}
                                placeholder="rate_per_min"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Уникален в пределах group + scope.
                            </p>
                        </div>
                        <div>
                            <Label>Domain (продукт)</Label>
                            <Input
                                value={v.domain}
                                onChange={(e) => set({ domain: e.target.value })}
                                placeholder="bulbulgo / booking / akcha…"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Пусто = кросс-продуктовый дефолт.
                            </p>
                        </div>
                        <div>
                            <Label>Описание</Label>
                            <Input
                                value={v.description}
                                onChange={(e) => set({ description: e.target.value })}
                                placeholder="Что это и зачем"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>Data (JSON)</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={prettify}>
                            <AlignLeft className="size-4 mr-1" /> Отформатировать
                        </Button>
                        <Button variant="outline" size="sm" onClick={minify}>
                            <Minimize2 className="size-4 mr-1" /> Свернуть
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Textarea
                        value={v.dataText}
                        onChange={(e) => set({ dataText: e.target.value })}
                        rows={24}
                        className="font-mono text-xs leading-relaxed resize-y"
                        spellCheck={false}
                    />
                    {error ? (
                        <p className="text-xs text-destructive">{error}</p>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Любое JSON-значение: число, строка, массив, объект. Кнопка
                            «Отформатировать» проверит синтаксис.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

type ActionsProps = {
    onSave: () => void
    onCancel: () => void
    saveLabel: string
    saving: boolean
}

export function SettingFormActions({ onSave, onCancel, saveLabel, saving }: ActionsProps) {
    return (
        <div className="flex gap-2">
            <Button onClick={onSave} disabled={saving}>
                {saveLabel}
            </Button>
            <Button variant="ghost" onClick={onCancel}>
                Отмена
            </Button>
        </div>
    )
}
