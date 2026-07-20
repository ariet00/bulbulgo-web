'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ensureAuth, initWebviewAuth } from '../../../auth'
import * as bridge from '../../../bridge'
import {
    createListing,
    fetchCategories,
    fetchCategoryAttributes,
    fetchCurrencies,
    fetchMe,
    fetchModelOptions,
    type RegionItem,
} from '../../lib/api'
import { pickLabel } from '../../lib/format'
import type {
    AttributeOption,
    EffectiveAttribute,
    ListingDraft,
    Photo,
} from '../../lib/types'
import { PickerSheet } from '../PickerSheet'
import { PhotosStep } from './PhotosStep'
import {
    BoolToggle,
    EnumChips,
    FieldLabel,
    NumberInput,
    RegionField,
    applyModelConstraints,
    inputCls,
    isAttrVisible,
    modelYearRange,
    useParamAttrs,
} from './fields'

// Wizard подачи. Продажа — 4 шага (марка/модель/год → параметры → фото →
// цена и контакты), «Куплю» — одна мягкая форма (обязательна только марка
// и бюджет). Заголовок не спрашиваем — бэк собирает его сам из справочника.

const YEARS: AttributeOption[] = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => {
    const y = 2026 - i
    return {
        id: y,
        value: String(y),
        label: { ru: String(y) },
        sort_order: i,
        brand: null,
        popular: false,
        constraints: null,
    }
})

type Values = Record<string, string | number | boolean | undefined>

export function WizardClient() {
    const router = useRouter()
    // диплинк с ?kind= пропускает экран выбора типа объявления
    const kindParam = useSearchParams().get('kind')
    const [kind, setKind] = useState<'offer' | 'want'>(
        kindParam === 'want' ? 'want' : 'offer',
    )
    const [kindChosen, setKindChosen] = useState(kindParam !== null)

    const [authed, setAuthed] = useState<boolean | null>(null)
    const [carsId, setCarsId] = useState<number | null>(null)
    const [attrs, setAttrs] = useState<EffectiveAttribute[]>([])
    const [currencyIds, setCurrencyIds] = useState<Record<string, number>>({})
    const [step, setStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // ── общее состояние формы ──
    const [make, setMake] = useState<string>()
    const [model, setModel] = useState<string>()
    const [models, setModels] = useState<string[]>([]) // want: несколько моделей
    const [year, setYear] = useState<number>()
    const [yearFrom, setYearFrom] = useState<number>()
    const [values, setValues] = useState<Values>({})
    const [photos, setPhotos] = useState<Photo[]>([])
    const [price, setPrice] = useState<number>()
    const [currency, setCurrency] = useState<'USD' | 'KGS'>('USD')
    const [description, setDescription] = useState('')
    const [region, setRegion] = useState<RegionItem | null>(null)
    const [phone, setPhone] = useState('')
    const [whatsapp, setWhatsapp] = useState(false)

    const [picker, setPicker] = useState<'make' | 'model' | 'year' | null>(null)
    const [modelOptions, setModelOptions] = useState<AttributeOption[]>([])
    const [modelsLoading, setModelsLoading] = useState(false)

    useEffect(() => {
        let alive = true
        ;(async () => {
            await initWebviewAuth()
            const ok = await ensureAuth()
            if (!alive) return
            setAuthed(ok)
            if (!ok) return
            const [tree, currencies, me] = await Promise.all([
                fetchCategories(),
                fetchCurrencies().catch(() => []),
                fetchMe().catch(() => ({ phone: null })),
            ])
            if (!alive) return
            setCurrencyIds(
                Object.fromEntries(currencies.map((c) => [c.code, c.id])),
            )
            if (me.phone) setPhone(me.phone)
            const cars = tree
                .find((c) => c.slug === 'auto')
                ?.children.find((c) => c.slug === 'cars')
            if (!cars) return
            setCarsId(cars.id)
            setAttrs(await fetchCategoryAttributes(cars.id))
        })()
        return () => {
            alive = false
        }
    }, [])

    const makeOptions = useMemo(
        () => attrs.find((a) => a.key === 'make')?.options ?? [],
        [attrs],
    )
    const attrByKey = useCallback(
        (key: string) => attrs.find((a) => a.key === key),
        [attrs],
    )
    const makeLabel = make
        ? pickLabel(makeOptions.find((o) => o.value === make)?.label) || make
        : undefined
    const modelLabelOf = (v: string) =>
        pickLabel(modelOptions.find((o) => o.value === v)?.label) || v

    const openModelPicker = async () => {
        if (!make) return
        setPicker('model')
        setModelsLoading(true)
        try {
            setModelOptions(await fetchModelOptions(make))
        } finally {
            setModelsLoading(false)
        }
    }

    // зависимые атрибуты (например, объём двигателя у электро) скрываются
    // по visible_when из каталога в зависимости от уже выбранных значений
    const { required: requiredAttrs, optional: optionalAttrs } =
        useParamAttrs(attrs, values)

    // constraints выбранной модели: реальные годы выпуска / кузова / топливо
    const modelConstraints = useMemo(
        () =>
            (kind === 'offer' && model
                ? modelOptions.find((o) => o.value === model)?.constraints
                : null) ?? null,
        [kind, model, modelOptions],
    )
    const yearRange = modelYearRange(modelConstraints)
    const yearOptions = useMemo(
        () =>
            !yearRange
                ? YEARS
                : YEARS.filter((y) => {
                      const n = Number(y.value)
                      return (
                          (yearRange.min === undefined || n >= yearRange.min) &&
                          (yearRange.max === undefined || n <= yearRange.max)
                      )
                  }),
        [yearRange],
    )

    // смена модели: чистим значения, ставшие недопустимыми, и автозаполняем
    // поля с единственным вариантом (у Camry кузов один — «Седан»)
    useEffect(() => {
        if (kind !== 'offer') return
        setValues((prev) => {
            const next = { ...prev }
            for (const a of attrs) {
                const narrowed = applyModelConstraints(a, modelConstraints)
                if (narrowed === a || a.type !== 'enum') continue
                const ok = new Set(narrowed.options.map((o) => o.value))
                const cur = next[a.key]
                if (typeof cur === 'string' && !ok.has(cur)) {
                    delete next[a.key]
                }
                if (next[a.key] === undefined && narrowed.options.length === 1) {
                    next[a.key] = narrowed.options[0].value
                }
            }
            return next
        })
        if (yearRange) {
            setYear((y) =>
                y !== undefined &&
                ((yearRange.min !== undefined && y < yearRange.min) ||
                    (yearRange.max !== undefined && y > yearRange.max))
                    ? undefined
                    : y,
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modelConstraints, kind])

    // want-атрибуты для мягких критериев (без make/model/year — они выше)
    const wantExtra = useMemo(
        () =>
            attrs.filter(
                (a) =>
                    ['fuel', 'transmission', 'steering', 'body'].includes(a.key) ||
                    (a.key === 'customs_cleared' && a.type === 'bool'),
            ),
        [attrs],
    )

    const stepValid = (): boolean => {
        if (kind === 'want') return !!make && !!price
        if (step === 0) return !!make && !!model && !!year
        if (step === 1)
            return requiredAttrs.every((a) => {
                const v = values[a.key]
                return v !== undefined && v !== '' && v !== null
            })
        if (step === 2) return photos.length >= 1
        return !!price && phone.trim().length >= 9
    }

    const submit = async () => {
        if (carsId === null || submitting) return
        setSubmitting(true)
        setError(null)
        try {
            const attributes: Record<string, unknown> = {}
            if (kind === 'offer') {
                Object.assign(attributes, { make, model, year })
                for (const [k, v] of Object.entries(values)) {
                    if (v === undefined || v === '') continue
                    // скрытые visible_when значения не отправляем (сменили
                    // бензин → электро: объём двигателя больше не применим)
                    const attr = attrs.find((a) => a.key === k)
                    if (attr && !isAttrVisible(attr, values)) continue
                    attributes[k] = v
                }
            } else {
                attributes.make = make
                if (models.length) attributes.model = models
                if (yearFrom) attributes.year = { min: yearFrom }
                for (const [k, v] of Object.entries(values)) {
                    if (v !== undefined && v !== '') attributes[k] = v
                }
            }
            const draft: ListingDraft = {
                category_id: carsId,
                kind,
                deal_type: 'sale',
                price,
                currency_id: currencyIds[currency],
                region_id: region?.id,
                description: description.trim() || undefined,
                attributes,
                photos,
                phone: phone.trim() || undefined,
                whatsapp,
            }
            const created = await createListing(draft)
            bridge.toast?.('Объявление опубликовано', 'success').catch(() => {})
            // тот же нативный экран становится карточкой — обновляем AppBar
            if (bridge.bridgeAvailable() && typeof created.title === 'string') {
                bridge.setTitle(created.title).catch(() => {})
            }
            router.replace(`/webview/auto_market/${created.id}`)
        } catch {
            setError('Не удалось опубликовать — проверьте поля и попробуйте ещё раз')
            setSubmitting(false)
        }
    }

    if (authed === false) {
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
                <p className="text-[17px] font-semibold">Нужен вход</p>
                <p className="mt-2 text-[14px] text-muted-foreground">
                    Чтобы подать объявление, войдите в аккаунт BulBul Go.
                </p>
                <button
                    onClick={async () => setAuthed(await ensureAuth())}
                    className="mt-6 rounded-xl px-6 py-3 text-[15px] font-semibold text-white"
                    style={{ background: 'var(--am-accent)' }}
                >
                    Войти
                </button>
            </div>
        )
    }

    if (authed === null || (authed && attrs.length === 0)) {
        return (
            <div className="space-y-4 p-4">
                <div className="am-skeleton h-8 w-52 rounded" />
                <div className="am-skeleton h-12 rounded-xl" />
                <div className="am-skeleton h-12 rounded-xl" />
                <div className="am-skeleton h-40 rounded-xl" />
            </div>
        )
    }

    const selectBtn = `${inputCls} flex items-center justify-between text-left`
    const steps = ['Авто', 'Параметры', 'Фото', 'Публикация']

    // ── шаг 0: что за объявление — продажа или запрос «куплю» ──
    if (!kindChosen) {
        const choose = (k: 'offer' | 'want') => {
            setKind(k)
            setStep(0)
            setError(null)
            setKindChosen(true)
        }
        const card =
            'flex w-full items-start gap-3.5 rounded-2xl border px-4 py-4 text-left active:bg-muted transition-colors'
        return (
            <div className="min-h-dvh px-4 pt-4">
                <h1 className="text-[20px] font-bold tracking-tight">
                    Новое объявление
                </h1>
                <p className="mt-1 text-[14px] text-muted-foreground">
                    Что хотите разместить?
                </p>

                <div className="mt-5 space-y-3">
                    <button onClick={() => choose('offer')} className={card}>
                        <span
                            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                            style={{ background: 'var(--am-accent)' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M5 17h14M4 17v-4.2a2 2 0 0 1 .2-.9l1.9-3.8A2 2 0 0 1 7.9 7h8.2a2 2 0 0 1 1.8 1.1l1.9 3.8a2 2 0 0 1 .2.9V17" />
                                <circle cx="8" cy="14.5" r="1" />
                                <circle cx="16" cy="14.5" r="1" />
                            </svg>
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[16px] font-semibold">
                                Продать авто
                            </span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                                Разместите объявление: фото, характеристики,
                                цена. Покупатели увидят его в ленте и свяжутся
                                с вами.
                            </span>
                        </span>
                    </button>

                    <button onClick={() => choose('want')} className={card}>
                        <span
                            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                            style={{
                                color: 'var(--am-accent)',
                                borderColor: 'var(--am-accent-border)',
                                background: 'var(--am-accent-soft)',
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                                <circle cx="7" cy="7" r="4.6" />
                                <path d="m10.6 10.6 3.4 3.4" />
                            </svg>
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[16px] font-semibold">
                                Куплю авто
                            </span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                                Оставьте запрос: какую машину ищете и бюджет.
                                Мы покажем подходящие объявления, а продавцы
                                увидят ваш запрос.
                            </span>
                        </span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-dvh px-4 pb-32 pt-4">
            <h1 className="text-[20px] font-bold tracking-tight">
                {kind === 'want' ? 'Куплю авто' : 'Продать авто'}
            </h1>

            {kind === 'offer' && (
                <div className="mt-3 flex items-center gap-1.5">
                    {steps.map((label, i) => (
                        <div key={label} className="flex-1">
                            <div
                                className="h-1 rounded-full"
                                style={{
                                    background:
                                        i <= step
                                            ? 'var(--am-accent)'
                                            : 'color-mix(in srgb, currentColor 15%, transparent)',
                                }}
                            />
                            <p
                                className="mt-1 text-[10px] font-medium"
                                style={{
                                    color:
                                        i === step
                                            ? 'var(--am-accent)'
                                            : 'var(--muted-foreground, inherit)',
                                    opacity: i === step ? 1 : 0.6,
                                }}
                            >
                                {label}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-5 space-y-5">
                {/* ── ПРОДАЖА: шаг 1 / КУПЛЮ: марка-модели-год ── */}
                {(kind === 'want' || step === 0) && (
                    <>
                        <div>
                            <p className="mb-2 text-[13px] font-semibold">
                                Марка{' '}
                                <span style={{ color: 'var(--am-accent)' }}>*</span>
                            </p>
                            <button type="button" onClick={() => setPicker('make')} className={selectBtn}>
                                <span className={make ? '' : 'text-muted-foreground'}>
                                    {makeLabel ?? 'Выберите марку'}
                                </span>
                                <span aria-hidden className="text-muted-foreground">▾</span>
                            </button>
                        </div>
                        <div>
                            <p className="mb-2 text-[13px] font-semibold">
                                {kind === 'want' ? 'Модели (можно несколько)' : 'Модель '}
                                {kind === 'offer' && (
                                    <span style={{ color: 'var(--am-accent)' }}>*</span>
                                )}
                            </p>
                            <button
                                type="button"
                                onClick={openModelPicker}
                                disabled={!make}
                                className={`${selectBtn} disabled:opacity-40`}
                            >
                                <span
                                    className={
                                        (kind === 'want' ? models.length : model)
                                            ? ''
                                            : 'text-muted-foreground'
                                    }
                                >
                                    {kind === 'want'
                                        ? models.length
                                          ? models.map(modelLabelOf).join(', ')
                                          : 'Любая'
                                        : model
                                          ? modelLabelOf(model)
                                          : 'Выберите модель'}
                                </span>
                                <span aria-hidden className="text-muted-foreground">▾</span>
                            </button>
                        </div>
                        <div>
                            <p className="mb-2 text-[13px] font-semibold">
                                {kind === 'want' ? 'Год, от' : 'Год выпуска '}
                                {kind === 'offer' && (
                                    <span style={{ color: 'var(--am-accent)' }}>*</span>
                                )}
                            </p>
                            {kind === 'want' ? (
                                <NumberInput value={yearFrom} onChange={setYearFrom} placeholder="например, 2015" />
                            ) : (
                                <button type="button" onClick={() => setPicker('year')} className={selectBtn}>
                                    <span className={year ? '' : 'text-muted-foreground'}>
                                        {year ?? 'Выберите год'}
                                    </span>
                                    <span aria-hidden className="text-muted-foreground">▾</span>
                                </button>
                            )}
                        </div>
                    </>
                )}

                {/* ── ПРОДАЖА: шаг 2 — параметры ── */}
                {kind === 'offer' && step === 1 && (
                    <>
                        {[...requiredAttrs, ...optionalAttrs]
                            .map((a) => applyModelConstraints(a, modelConstraints))
                            .map((a) => (
                            <div key={a.key}>
                                {a.type !== 'bool' && (
                                    <FieldLabel
                                        attr={a}
                                        required={a.required_sides.includes('offer')}
                                    />
                                )}
                                {a.type === 'enum' ? (
                                    <EnumChips
                                        attr={a}
                                        value={values[a.key] as string | undefined}
                                        onChange={(v) =>
                                            setValues((s) => ({ ...s, [a.key]: v }))
                                        }
                                    />
                                ) : a.type === 'bool' ? (
                                    <BoolToggle
                                        label={pickLabel(a.label)}
                                        value={!!values[a.key]}
                                        onChange={(v) =>
                                            setValues((s) => ({ ...s, [a.key]: v }))
                                        }
                                    />
                                ) : (
                                    <NumberInput
                                        decimal={a.type === 'decimal'}
                                        value={values[a.key] as number | undefined}
                                        onChange={(v) =>
                                            setValues((s) => ({ ...s, [a.key]: v }))
                                        }
                                    />
                                )}
                            </div>
                        ))}
                    </>
                )}

                {/* ── ПРОДАЖА: шаг 3 — фото ── */}
                {kind === 'offer' && step === 2 && (
                    <PhotosStep photos={photos} onChange={setPhotos} />
                )}

                {/* ── финальный шаг (offer) / хвост формы (want) ── */}
                {(kind === 'want' || step === 3) && (
                    <>
                        <div>
                            <p className="mb-2 text-[13px] font-semibold">
                                {kind === 'want' ? 'Бюджет, до' : 'Цена'}{' '}
                                <span style={{ color: 'var(--am-accent)' }}>*</span>
                            </p>
                            <div className="flex gap-2">
                                <NumberInput
                                    value={price}
                                    onChange={setPrice}
                                    placeholder={currency === 'USD' ? '15 000' : '1 300 000'}
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
                                                    ? { background: 'var(--am-accent)', color: '#fff' }
                                                    : undefined
                                            }
                                        >
                                            {c === 'USD' ? '$' : 'сом'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {kind === 'want' && (
                            <div className="space-y-4">
                                {wantExtra.map((a) =>
                                    a.type === 'bool' ? (
                                        <BoolToggle
                                            key={a.key}
                                            label={pickLabel(a.label)}
                                            value={!!values[a.key]}
                                            onChange={(v) =>
                                                setValues((s) => ({ ...s, [a.key]: v || undefined }))
                                            }
                                        />
                                    ) : (
                                        <div key={a.key}>
                                            <FieldLabel attr={a} required={false} />
                                            <EnumChips
                                                attr={a}
                                                value={values[a.key] as string | undefined}
                                                onChange={(v) =>
                                                    setValues((s) => ({ ...s, [a.key]: v }))
                                                }
                                            />
                                        </div>
                                    ),
                                )}
                            </div>
                        )}

                        <div>
                            <p className="mb-2 text-[13px] font-semibold">Город / регион</p>
                            <RegionField region={region} onChange={setRegion} />
                        </div>

                        <div>
                            <p className="mb-2 text-[13px] font-semibold">
                                {kind === 'want' ? 'Комментарий' : 'Описание'}
                            </p>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                maxLength={5000}
                                placeholder={
                                    kind === 'want'
                                        ? 'Что важно: состояние, комплектация…'
                                        : 'Состояние, комплектация, что менялось…'
                                }
                                className={`${inputCls} resize-none`}
                            />
                        </div>

                        <div>
                            <p className="mb-2 text-[13px] font-semibold">
                                Телефон для связи{' '}
                                <span style={{ color: 'var(--am-accent)' }}>*</span>
                            </p>
                            <input
                                inputMode="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+996 700 000 000"
                                className={inputCls}
                            />
                            <div className="mt-3">
                                <BoolToggle
                                    label="На этом номере есть WhatsApp"
                                    value={whatsapp}
                                    onChange={setWhatsapp}
                                />
                            </div>
                        </div>
                    </>
                )}

                {error && <p className="text-[13px] text-red-500">{error}</p>}
            </div>

            {/* нижняя панель навигации */}
            <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur">
                <button
                    onClick={() => {
                        // с первого шага ветки — обратно к выбору типа
                        if (kind === 'offer' && step > 0) setStep((s) => s - 1)
                        else setKindChosen(false)
                    }}
                    className="rounded-xl border px-5 py-3 text-[14px] font-medium active:bg-muted"
                >
                    Назад
                </button>
                <button
                    disabled={!stepValid() || submitting}
                    onClick={() =>
                        kind === 'offer' && step < 3
                            ? setStep((s) => s + 1)
                            : submit()
                    }
                    className="flex-1 rounded-xl py-3 text-[15px] font-semibold text-white active:opacity-90 disabled:opacity-40"
                    style={{ background: 'var(--am-accent)' }}
                >
                    {submitting
                        ? 'Публикуем…'
                        : kind === 'offer' && step < 3
                          ? 'Далее'
                          : 'Опубликовать'}
                </button>
            </div>

            {/* пикеры */}
            <PickerSheet
                open={picker === 'make'}
                onClose={() => setPicker(null)}
                title="Марка"
                options={makeOptions}
                selected={make ? [make] : []}
                onApply={([v]) => {
                    if (v !== make) {
                        setModel(undefined)
                        setModels([])
                    }
                    setMake(v)
                }}
            />
            <PickerSheet
                open={picker === 'model'}
                onClose={() => setPicker(null)}
                title={makeLabel ? `Модели ${makeLabel}` : 'Модель'}
                options={modelOptions}
                loading={modelsLoading}
                selected={kind === 'want' ? models : model ? [model] : []}
                multi={kind === 'want'}
                onApply={(vals) =>
                    kind === 'want' ? setModels(vals) : setModel(vals[0])
                }
            />
            <PickerSheet
                open={picker === 'year'}
                onClose={() => setPicker(null)}
                title="Год выпуска"
                options={yearOptions}
                selected={year ? [String(year)] : []}
                onApply={([v]) => setYear(Number(v))}
            />
        </div>
    )
}
