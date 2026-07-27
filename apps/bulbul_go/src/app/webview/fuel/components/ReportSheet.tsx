'use client'

// Форма репорта: марки (мультивыбор) → статус → очередь → цена/ограничение →
// отправить. Поля порождаются из /fuel/meta (enum'ы бэка) — RHF-схема тут ни
// к чему, локальный useState с ручной проверкой обязательных шагов.
// Цена доступна только при одной выбранной марке (общая цена на несколько
// марок бессмысленна). Отправка гейтится ensureAuth(); позиция репортёра —
// если не была получена при загрузке, запрашивается у моста в момент
// сабмита и уходит в payload.location (провенанс метки). Отказ от гео
// отправку не блокирует.

import { useEffect, useState } from 'react'
import { ensureAuth } from '../../auth'
import {
    bridgeAvailable,
    getLocation,
    haptic,
    toast,
    waitForBridge,
} from '../../bridge'
import { BottomSheet } from '../../auto/components/BottomSheet'
import { ReportRateLimited, submitReport } from '../lib/api'
import { STATUS_COLOR, metaLabel } from '../lib/format'
import { useFuelInvalidation } from '../lib/queries'
import type {
    FuelMeta,
    FuelStatus,
    FuelType,
    LatLng,
    QueueBucket,
    Restriction,
    Station,
} from '../lib/types'

async function notify(text: string, type: 'success' | 'error' | 'warning') {
    if (bridgeAvailable()) await toast(text, type).catch(() => {})
    else window.alert(text)
}

export function ReportSheet({
    station,
    meta,
    origin,
    geoKnown,
    onClose,
}: {
    station: Station | null
    meta: FuelMeta | undefined
    /** позиция, полученная при загрузке ленты (null — не удалось) */
    origin: LatLng | null
    /** false — пользователь уже отказал в гео (origin — фолбэк-центр) */
    geoKnown: boolean
    onClose: () => void
}) {
    const invalidate = useFuelInvalidation()
    const [fuelTypes, setFuelTypes] = useState<FuelType[]>([])
    const [status, setStatus] = useState<FuelStatus | null>(null)
    const [queue, setQueue] = useState<QueueBucket | null>(null)
    const [price, setPrice] = useState('')
    const [restriction, setRestriction] = useState<Restriction | null>(null)
    const [sending, setSending] = useState(false)

    // сброс формы при открытии по новой станции
    useEffect(() => {
        if (station) {
            setFuelTypes(
                station.fuel_types.length === 1 ? [...station.fuel_types] : [],
            )
            setStatus(null)
            setQueue(null)
            setPrice('')
            setRestriction(null)
            setSending(false)
        }
    }, [station])

    const grades: FuelType[] = station
        ? station.fuel_types.length
            ? station.fuel_types
            : (meta?.fuel_types.map((o) => o.value as FuelType) ?? [])
        : []

    const toggleGrade = (g: FuelType) =>
        setFuelTypes((prev) =>
            prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
        )

    const priceAllowed = fuelTypes.length === 1 && status !== null && status !== 'out'
    const canSubmit = fuelTypes.length > 0 && !!status && !sending

    /** Позиция репортёра: из ленты, а если её нет — свежий запрос у моста
     * (нативный диалог разрешения появится здесь, в момент отметки). */
    const resolveLocation = async (): Promise<LatLng | null> => {
        if (geoKnown && origin) return origin
        if (!(await waitForBridge(1500))) return null
        const loc = await getLocation().catch(() => null)
        return loc ? { lat: loc.latitude, lng: loc.longitude } : null
    }

    const submit = async () => {
        if (!station || !fuelTypes.length || !status || sending) return
        setSending(true)
        try {
            if (!(await ensureAuth())) {
                await notify('Войдите в приложение, чтобы отмечать статус', 'warning')
                return
            }
            const location = await resolveLocation()
            const parsedPrice = parseFloat(price.replace(',', '.'))
            await submitReport(station.id, {
                fuel_types: fuelTypes,
                status,
                queue: status === 'out' ? null : queue,
                price:
                    priceAllowed && Number.isFinite(parsedPrice)
                        ? parsedPrice
                        : null,
                restriction,
                location,
            })
            invalidate(station.id)
            void haptic('success').catch(() => {})
            await notify('Спасибо! Отметка сохранена', 'success')
            onClose()
        } catch (e) {
            void haptic('error').catch(() => {})
            await notify(
                e instanceof ReportRateLimited
                    ? 'По этой АЗС вы уже отмечались недавно'
                    : 'Не получилось отправить — попробуйте ещё раз',
                'error',
            )
        } finally {
            setSending(false)
        }
    }

    return (
        <BottomSheet
            open={station !== null}
            onClose={onClose}
            title="Что на заправке?"
            footer={
                <button
                    disabled={!canSubmit}
                    onClick={() => void submit()}
                    className="w-full rounded-xl bg-[var(--fl-accent)] py-3 text-[15px] font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-40"
                >
                    {sending ? 'Отправляем…' : 'Отправить отметку'}
                </button>
            }
        >
            {station && (
                <div className="flex flex-col gap-4">
                    <p className="-mt-1 text-[13px] text-muted-foreground">
                        {station.name}
                    </p>

                    <Field label="Марки топлива (можно несколько)">
                        <div className="flex flex-wrap gap-1.5">
                            {grades.map((g) => (
                                <Chip
                                    key={g}
                                    active={fuelTypes.includes(g)}
                                    onClick={() => toggleGrade(g)}
                                >
                                    {metaLabel(meta?.fuel_types, g)}
                                </Chip>
                            ))}
                        </div>
                    </Field>

                    <Field label="Статус">
                        <div className="grid grid-cols-2 gap-1.5">
                            {(meta?.statuses ?? []).map((opt) => {
                                const color = STATUS_COLOR[opt.value as FuelStatus]
                                const active = status === opt.value
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => setStatus(opt.value as FuelStatus)}
                                        className="rounded-xl border px-3 py-2.5 text-[13.5px] font-semibold transition-colors"
                                        style={
                                            active
                                                ? {
                                                      color,
                                                      borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
                                                      backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                                                  }
                                                : undefined
                                        }
                                    >
                                        {metaLabel(meta?.statuses, opt.value)}
                                    </button>
                                )
                            })}
                        </div>
                    </Field>

                    {status && status !== 'out' && (
                        <Field label="Очередь (необязательно)">
                            <div className="flex flex-wrap gap-1.5">
                                {(meta?.queue_buckets ?? []).map((opt) => (
                                    <Chip
                                        key={opt.value}
                                        active={queue === opt.value}
                                        onClick={() =>
                                            setQueue(
                                                queue === opt.value
                                                    ? null
                                                    : (opt.value as QueueBucket),
                                            )
                                        }
                                    >
                                        {metaLabel(meta?.queue_buckets, opt.value)}
                                    </Chip>
                                ))}
                            </div>
                        </Field>
                    )}

                    {priceAllowed && (
                        <Field label="Цена, сом/л (необязательно)">
                            <input
                                inputMode="decimal"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Напр. 62.5"
                                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[14px] outline-none placeholder:text-muted-foreground/60 focus:border-[var(--fl-accent-border)]"
                            />
                        </Field>
                    )}

                    <Field label="Ограничения (необязательно)">
                        <div className="flex flex-wrap gap-1.5">
                            {(meta?.restrictions ?? []).map((opt) => (
                                <Chip
                                    key={opt.value}
                                    active={restriction === opt.value}
                                    onClick={() =>
                                        setRestriction(
                                            restriction === opt.value
                                                ? null
                                                : (opt.value as Restriction),
                                        )
                                    }
                                >
                                    {metaLabel(meta?.restrictions, opt.value)}
                                </Chip>
                            ))}
                        </div>
                    </Field>
                </div>
            )}
        </BottomSheet>
    )
}

function Field({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <div>
            <p className="mb-1.5 text-[13px] font-semibold text-muted-foreground">
                {label}
            </p>
            {children}
        </div>
    )
}

function Chip({
    active,
    onClick,
    children,
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            className={
                'rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ' +
                (active
                    ? 'border-[var(--fl-accent-border)] bg-[var(--fl-accent-soft)] text-[var(--fl-accent)]'
                    : 'border-border bg-background text-muted-foreground active:bg-muted')
            }
        >
            {children}
        </button>
    )
}
