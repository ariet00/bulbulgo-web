'use client'

import { Button, Input, Label } from '@doska/ui'
import { X } from 'lucide-react'

/// Курируемый набор оттенков. Сейчас «Главная» рисует все значки одним
/// акцентным цветом (см. _iconColor в service_card.dart) и это поле не
/// применяет — оно осталось на случай возврата цветных значков.
const PRESETS = [
    '#2F6FD0',
    '#2E9E63',
    '#D8722C',
    '#7B54CF',
    '#D0455F',
    '#2C93A8',
    '#C79A22',
    '#B44BA6',
]

/** Цвет значка карточки: пресеты, свой HEX и сброс на автоподбор. */
export function IconColorInput({
    value,
    onChange,
}: {
    value: string
    onChange: (next: string) => void
}) {
    return (
        <div className="space-y-1.5">
            <Label>Цвет значка</Label>
            <div className="flex items-center gap-2">
                <span
                    className="size-9 shrink-0 rounded-md border"
                    style={{ backgroundColor: value || 'transparent' }}
                />
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#2F6FD0 — пусто = приложение подберёт само"
                />
                {!!value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onChange('')}
                        title="Сбросить на автоподбор"
                    >
                        <X className="size-4" />
                    </Button>
                )}
            </div>
            <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                    <button
                        key={preset}
                        type="button"
                        onClick={() => onChange(preset)}
                        style={{ backgroundColor: preset }}
                        className="size-6 rounded-md border transition-transform hover:scale-110"
                        title={preset}
                    />
                ))}
            </div>
        </div>
    )
}
