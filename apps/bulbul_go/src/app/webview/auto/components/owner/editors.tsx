'use client'

import { useState } from 'react'
import { BottomSheet } from '../../../components/BottomSheet'
import { inputCls } from '../wizard/fields'

// Шиты пополевого редактирования на странице владельца: пользователь редко
// меняет несколько полей за раз, поэтому каждый шит правит и сохраняет
// ровно одно поле (паттерн из rideshare).

function SaveButton({
    onClick,
    saving,
    disabled = false,
}: {
    onClick: () => void
    saving: boolean
    disabled?: boolean
}) {
    return (
        <button
            onClick={onClick}
            disabled={saving || disabled}
            className="w-full rounded-xl py-3 text-[15px] font-semibold text-white active:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--wv-primary)' }}
        >
            {saving ? 'Сохраняем…' : 'Сохранить'}
        </button>
    )
}

/** Числовое поле (пробег, объём, год «куплю»-бюджета и т.п.). */
export function NumberEditSheet({
    open,
    onClose,
    title,
    unit,
    initial,
    decimal = false,
    onSave,
}: {
    open: boolean
    onClose: () => void
    title: string
    unit?: string
    initial: number | undefined
    decimal?: boolean
    onSave: (v: number) => Promise<void>
}) {
    const [raw, setRaw] = useState('')
    const [saving, setSaving] = useState(false)

    const [wasOpen, setWasOpen] = useState(false)
    if (open && !wasOpen) {
        setWasOpen(true)
        setRaw(initial !== undefined ? String(initial) : '')
    } else if (!open && wasOpen) {
        setWasOpen(false)
    }

    const parsed = decimal
        ? parseFloat(raw.replace(/\s/g, '').replace(',', '.'))
        : parseInt(raw.replace(/\s/g, ''), 10)

    const save = async () => {
        if (Number.isNaN(parsed)) return
        setSaving(true)
        try {
            await onSave(parsed)
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={unit ? `${title}, ${unit}` : title}
            footer={<SaveButton onClick={save} saving={saving} disabled={Number.isNaN(parsed)} />}
        >
            <input
                inputMode={decimal ? 'decimal' : 'numeric'}
                autoFocus
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                className={inputCls}
            />
        </BottomSheet>
    )
}

/** Цена с выбором валюты (USD/KGS). */
export function PriceEditSheet({
    open,
    onClose,
    title = 'Цена',
    initialAmount,
    initialCurrency,
    onSave,
}: {
    open: boolean
    onClose: () => void
    title?: string
    initialAmount: number | undefined
    initialCurrency: 'USD' | 'KGS'
    onSave: (amount: number, currency: 'USD' | 'KGS') => Promise<void>
}) {
    const [raw, setRaw] = useState('')
    const [currency, setCurrency] = useState<'USD' | 'KGS'>('USD')
    const [saving, setSaving] = useState(false)

    const [wasOpen, setWasOpen] = useState(false)
    if (open && !wasOpen) {
        setWasOpen(true)
        setRaw(initialAmount !== undefined ? String(Math.round(initialAmount)) : '')
        setCurrency(initialCurrency)
    } else if (!open && wasOpen) {
        setWasOpen(false)
    }

    const parsed = parseInt(raw.replace(/\s/g, ''), 10)
    const save = async () => {
        if (Number.isNaN(parsed) || parsed <= 0) return
        setSaving(true)
        try {
            await onSave(parsed, currency)
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <SaveButton
                    onClick={save}
                    saving={saving}
                    disabled={Number.isNaN(parsed) || parsed <= 0}
                />
            }
        >
            <div className="flex gap-2">
                <input
                    inputMode="numeric"
                    autoFocus
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                    placeholder={currency === 'USD' ? '15 000' : '1 300 000'}
                    className={inputCls}
                />
                <div className="flex shrink-0 overflow-hidden rounded-xl border text-[13px] font-semibold">
                    {(['USD', 'KGS'] as const).map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setCurrency(c)}
                            className="px-3"
                            style={
                                currency === c
                                    ? {
                                          background: 'var(--wv-primary)',
                                          color: 'var(--wv-on-primary)',
                                      }
                                    : undefined
                            }
                        >
                            {c === 'USD' ? '$' : 'сом'}
                        </button>
                    ))}
                </div>
            </div>
        </BottomSheet>
    )
}

/** Многострочный текст (описание). */
export function TextEditSheet({
    open,
    onClose,
    title,
    initial,
    placeholder,
    onSave,
}: {
    open: boolean
    onClose: () => void
    title: string
    initial: string
    placeholder?: string
    onSave: (v: string) => Promise<void>
}) {
    const [value, setValue] = useState('')
    const [saving, setSaving] = useState(false)

    const [wasOpen, setWasOpen] = useState(false)
    if (open && !wasOpen) {
        setWasOpen(true)
        setValue(initial)
    } else if (!open && wasOpen) {
        setWasOpen(false)
    }

    const save = async () => {
        setSaving(true)
        try {
            await onSave(value.trim())
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={title}
            footer={<SaveButton onClick={save} saving={saving} />}
        >
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={6}
                maxLength={5000}
                autoFocus
                placeholder={placeholder}
                className={`${inputCls} resize-none`}
            />
        </BottomSheet>
    )
}

/** Контактный телефон + WhatsApp. */
export function ContactEditSheet({
    open,
    onClose,
    initialPhone,
    initialWhatsapp,
    onSave,
}: {
    open: boolean
    onClose: () => void
    initialPhone: string
    initialWhatsapp: boolean
    onSave: (phone: string, whatsapp: boolean) => Promise<void>
}) {
    const [phone, setPhone] = useState('')
    const [whatsapp, setWhatsapp] = useState(false)
    const [saving, setSaving] = useState(false)

    const [wasOpen, setWasOpen] = useState(false)
    if (open && !wasOpen) {
        setWasOpen(true)
        setPhone(initialPhone)
        setWhatsapp(initialWhatsapp)
    } else if (!open && wasOpen) {
        setWasOpen(false)
    }

    const save = async () => {
        if (phone.trim().length < 9) return
        setSaving(true)
        try {
            await onSave(phone.trim(), whatsapp)
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title="Контакты"
            footer={
                <SaveButton
                    onClick={save}
                    saving={saving}
                    disabled={phone.trim().length < 9}
                />
            }
        >
            <input
                inputMode="tel"
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+996 700 000 000"
                className={inputCls}
            />
            <button
                type="button"
                onClick={() => setWhatsapp((w) => !w)}
                className="mt-4 flex w-full items-center justify-between"
            >
                <span className="text-[14px]">На этом номере есть WhatsApp</span>
                <span
                    aria-hidden
                    className="relative h-6 w-10 rounded-full transition-colors"
                    style={{
                        background: whatsapp
                            ? 'var(--wv-primary)'
                            : 'color-mix(in srgb, currentColor 20%, transparent)',
                    }}
                >
                    <span
                        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                        style={{
                            left: whatsapp ? 'calc(100% - 1.375rem)' : '0.125rem',
                        }}
                    />
                </span>
            </button>
        </BottomSheet>
    )
}
