'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ensureAuth, initWebviewAuth } from '../../../auth'
import * as bridge from '../../../bridge'
import { createListing, fetchMe, type RegionItem } from '../../lib/api'
import { pickLabel } from '../../lib/format'
import {
    useCatalog,
    useCategoryAttributes,
    useCurrencies,
    useListingInvalidation,
    useModelOptions,
} from '../../lib/queries'
import type {
    AttributeOption,
    CategoryNode,
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

// Wizard подачи, управляемый категорией. Шаг 0 — выбор ветки (Легковые/
// Грузовые/Мото/Запчасти/Сервисы), затем сторона (Продать/Куплю — только если
// у ветки обе). Шаги формы порождаются метаданными категории: «Авто/Основное»
// (make/model/year — где есть), «Параметры», «Название» (если нет strict_title),
// «Фото» (по min_photos_offer), «Публикация». Услуги — только offer, цена
// договорная.

const YEARS: AttributeOption[] = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => {
    const y = 2026 - i
    return {
        id: y, value: String(y), label: { ru: String(y) },
        sort_order: i, brand: null, popular: false, constraints: null,
    }
})

const CAT_DESC: Record<string, string> = {
    cars: 'Легковые автомобили',
    trucks: 'Грузовики и коммерческий транспорт',
    moto: 'Мотоциклы, скутеры, квадроциклы',
    parts: 'Запчасти и аксессуары',
    services: 'Автосервисы и услуги',
}

type Values = Record<string, string | number | boolean | undefined>
type StepKey = 'main' | 'params' | 'photos' | 'publish'

export function WizardClient() {
    const router = useRouter()
    const kindParam = useSearchParams().get('kind')
    const invalidate = useListingInvalidation()

    const [authed, setAuthed] = useState<boolean | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // ── выбор ветки и стороны ──
    const [catId, setCatId] = useState<number | null>(null)
    const [kind, setKind] = useState<'offer' | 'want'>(
        kindParam === 'want' ? 'want' : 'offer',
    )
    const [kindChosen, setKindChosen] = useState(false)
    const [step, setStep] = useState(0)

    // ── состояние формы ──
    const [make, setMake] = useState<string>()
    const [model, setModel] = useState<string>()
    const [models, setModels] = useState<string[]>([])
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

    useEffect(() => {
        let alive = true
        ;(async () => {
            await initWebviewAuth()
            const ok = await ensureAuth()
            if (!alive) return
            setAuthed(ok)
            if (!ok) return
            fetchMe()
                .then((me) => alive && me.phone && setPhone(me.phone))
                .catch(() => {})
        })()
        return () => {
            alive = false
        }
    }, [])

    // ── каталог: ветки (дети auto под скоупом сервиса) ──
    const { data: tree } = useCatalog()
    const tabs = useMemo(() => {
        const auto = tree?.find((c) => c.slug === 'auto')
        return (auto?.children ?? [])
            .filter((c) => c.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
    }, [tree])
    const category = tabs.find((t) => t.id === catId) ?? null

    const { data: attrs = [] } = useCategoryAttributes(
        catId,
        kind === 'want' ? 'want' : 'offer',
    )
    const { data: currencies = [] } = useCurrencies()
    const currencyIds = useMemo(
        () => Object.fromEntries(currencies.map((c) => [c.code, c.id])),
        [currencies],
    )
    const { data: modelOptions = [], isLoading: modelsLoading } =
        useModelOptions(make)

    const makeOptions = attrs.find((a) => a.key === 'make')?.options ?? []
    const hasMake = attrs.some((a) => a.key === 'make')
    const hasModel = attrs.some((a) => a.key === 'model')
    const hasYear = attrs.some((a) => a.key === 'year')
    const makeLabel = make
        ? pickLabel(makeOptions.find((o) => o.value === make)?.label) || make
        : undefined
    const modelLabelOf = (v: string) =>
        pickLabel(modelOptions.find((o) => o.value === v)?.label) || v

    const { required: requiredAttrs, optional: optionalAttrs } = useParamAttrs(
        attrs,
        values,
    )

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

    // смена модели: чистим ставшие недопустимыми значения + автозаполняем поля
    // с единственным вариантом
    useEffect(() => {
        if (kind !== 'offer') return
        setValues((prev) => {
            const next = { ...prev }
            for (const a of attrs) {
                const narrowed = applyModelConstraints(a, modelConstraints)
                if (narrowed === a || a.type !== 'enum') continue
                const ok = new Set(narrowed.options.map((o) => o.value))
                if (typeof next[a.key] === 'string' && !ok.has(next[a.key] as string)) {
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

    // want-критерии (мягкие): фильтруемые enum/bool ветки, без make/model/year
    const wantExtra = useMemo(
        () =>
            attrs.filter(
                (a) =>
                    a.role !== 'system' &&
                    a.is_filterable &&
                    !['make', 'model', 'year'].includes(a.key) &&
                    (a.type === 'enum' || a.type === 'bool'),
            ),
        [attrs],
    )

    // ── шаги формы, порождённые категорией (offer) ──
    const steps: { key: StepKey; label: string }[] = useMemo(() => {
        if (!category) return []
        const s: { key: StepKey; label: string }[] = []
        if (hasMake || hasYear)
            s.push({ key: 'main', label: hasMake ? 'Авто' : 'Основное' })
        s.push({ key: 'params', label: 'Параметры' })
        s.push({ key: 'photos', label: 'Фото' })
        s.push({ key: 'publish', label: 'Публикация' })
        return s
    }, [category, hasMake, hasYear])
    const currentStep = steps[step]?.key

    const pickCategory = (c: CategoryNode) => {
        setCatId(c.id)
        setStep(0)
        setError(null)
        // услуги (одна сторона) — сразу offer, экран выбора стороны пропускаем
        if (c.kinds.length === 1) {
            setKind(c.kinds[0])
            setKindChosen(true)
        } else {
            setKindChosen(kindParam !== null && c.kinds.includes(kind))
        }
    }

    const openModelPicker = () => {
        if (make) setPicker('model')
    }

    const stepValid = (): boolean => {
        if (kind === 'want')
            return (!hasMake || !!make) && (!!price || !!category?.price_optional)
        if (currentStep === 'main')
            return (
                (!hasMake || !!make) &&
                (!hasModel || !!model) &&
                (!hasYear || !!year)
            )
        if (currentStep === 'params')
            return requiredAttrs.every((a) => {
                const v = values[a.key]
                return v !== undefined && v !== '' && v !== null
            })
        if (currentStep === 'photos')
            return photos.length >= (category?.min_photos_offer ?? 0)
        // publish
        return (
            (!!price || !!category?.price_optional) && phone.trim().length >= 9
        )
    }

    const submit = async () => {
        if (catId === null || submitting) return
        setSubmitting(true)
        setError(null)
        try {
            const attributes: Record<string, unknown> = {}
            if (kind === 'offer') {
                if (make) attributes.make = make
                if (model) attributes.model = model
                if (year) attributes.year = year
                for (const [k, v] of Object.entries(values)) {
                    if (v === undefined || v === '') continue
                    const attr = attrs.find((a) => a.key === k)
                    if (attr && !isAttrVisible(attr, values)) continue
                    attributes[k] = v
                }
            } else {
                if (make) attributes.make = make
                if (models.length) attributes.model = models
                if (yearFrom) attributes.year = { min: yearFrom }
                for (const [k, v] of Object.entries(values)) {
                    if (v !== undefined && v !== '') attributes[k] = v
                }
            }
            const draft: ListingDraft = {
                category_id: catId,
                kind,
                deal_type: 'sale',
                price,
                currency_id: price ? currencyIds[currency] : undefined,
                region_id: region?.id,
                description: description.trim() || undefined,
                attributes,
                photos,
                phone: phone.trim() || undefined,
                whatsapp,
            }
            const created = await createListing(draft)
            invalidate(created)
            bridge.toast?.('Объявление опубликовано', 'success').catch(() => {})
            if (bridge.bridgeAvailable() && typeof created.title === 'string') {
                bridge.setTitle(created.title).catch(() => {})
            }
            router.replace(`/webview/auto/${created.id}`)
        } catch {
            setError('Не удалось опубликовать — проверьте поля и попробуйте ещё раз')
            setSubmitting(false)
        }
    }

    // ── экраны ──
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
                    style={{ background: 'var(--wv-primary)' }}
                >
                    Войти
                </button>
            </div>
        )
    }

    const selectBtn = `${inputCls} flex items-center justify-between text-left`
    const accent = (on: boolean): React.CSSProperties =>
        on
            ? { background: 'var(--wv-primary)', color: 'var(--wv-on-primary)' }
            : { opacity: 0.7 }

    // шаг 0 — выбор ветки
    if (catId === null) {
        if (authed === null || tabs.length === 0) {
            return (
                <div className="space-y-3 p-4">
                    <div className="wv-skeleton h-8 w-52 rounded" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="wv-skeleton h-16 rounded-2xl" />
                    ))}
                </div>
            )
        }
        return (
            <div className="min-h-dvh px-4 pt-4">
                <h1 className="text-[20px] font-bold tracking-tight">
                    Новое объявление
                </h1>
                <p className="mt-1 text-[14px] text-muted-foreground">
                    Что размещаете?
                </p>
                <div className="mt-5 space-y-2.5">
                    {tabs.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => pickCategory(c)}
                            className="flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left active:bg-muted"
                        >
                            <span>
                                <span className="block text-[15px] font-semibold">
                                    {pickLabel(c.label)}
                                </span>
                                <span className="mt-0.5 block text-[12px] text-muted-foreground">
                                    {CAT_DESC[c.slug] ?? ''}
                                </span>
                            </span>
                            <span aria-hidden className="text-muted-foreground">›</span>
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    // шаг 0.5 — выбор стороны (только если у ветки обе)
    if (!kindChosen) {
        const choose = (k: 'offer' | 'want') => {
            setKind(k)
            setStep(0)
            setError(null)
            setKindChosen(true)
        }
        const card =
            'flex w-full items-start gap-3.5 rounded-2xl border px-4 py-4 text-left active:bg-muted'
        return (
            <div className="min-h-dvh px-4 pt-4">
                <button
                    onClick={() => setCatId(null)}
                    className="mb-2 -ml-1 flex items-center gap-1 text-[14px] text-muted-foreground active:opacity-70"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M10 3 5 8l5 5" />
                    </svg>
                    Ветка
                </button>
                <h1 className="text-[20px] font-bold tracking-tight">
                    {category ? pickLabel(category.label) : 'Объявление'}
                </h1>
                <p className="mt-1 text-[14px] text-muted-foreground">
                    Что хотите разместить?
                </p>
                <div className="mt-5 space-y-3">
                    <button onClick={() => choose('offer')} className={card}>
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: 'var(--wv-primary)' }}>
                            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                                <path d="M2 8.5 8 2l6 6.5M3.5 7v6.5h9V7" />
                            </svg>
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[16px] font-semibold">Продать</span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                                Разместите объявление: фото, характеристики, цена.
                                Покупатели найдут его в ленте.
                            </span>
                        </span>
                    </button>
                    <button onClick={() => choose('want')} className={card}>
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border" style={{ color: 'var(--wv-accent)', borderColor: 'var(--wv-accent-border)', background: 'var(--wv-accent-soft)' }}>
                            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                                <circle cx="7" cy="7" r="4.6" />
                                <path d="m10.6 10.6 3.4 3.4" />
                            </svg>
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[16px] font-semibold">Куплю</span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                                Оставьте запрос: что ищете и бюджет. Покажем
                                подходящее, продавцы увидят запрос.
                            </span>
                        </span>
                    </button>
                </div>
            </div>
        )
    }

    if (attrs.length === 0) {
        return (
            <div className="space-y-4 p-4">
                <div className="wv-skeleton h-8 w-52 rounded" />
                <div className="wv-skeleton h-12 rounded-xl" />
                <div className="wv-skeleton h-12 rounded-xl" />
                <div className="wv-skeleton h-40 rounded-xl" />
            </div>
        )
    }

    // рендер одного enum/number/bool-поля (params, want-критерии)
    const renderAttr = (a: EffectiveAttribute, wantMode = false) =>
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
                <FieldLabel
                    attr={a}
                    required={!wantMode && a.required_sides.includes('offer')}
                />
                {a.type === 'enum' ? (
                    <EnumChips
                        attr={a}
                        value={values[a.key] as string | undefined}
                        onChange={(v) => setValues((s) => ({ ...s, [a.key]: v }))}
                    />
                ) : (
                    <NumberInput
                        decimal={a.type === 'decimal'}
                        value={values[a.key] as number | undefined}
                        onChange={(v) => setValues((s) => ({ ...s, [a.key]: v }))}
                    />
                )}
            </div>
        )

    return (
        <div className="min-h-dvh px-4 pb-32 pt-4">
            <h1 className="text-[20px] font-bold tracking-tight">
                {category ? pickLabel(category.label) : 'Объявление'}
                {kind === 'want' ? ' — куплю' : ''}
            </h1>

            {/* прогресс шагов (offer) */}
            {kind === 'offer' && steps.length > 1 && (
                <div className="mt-3 flex items-center gap-1.5">
                    {steps.map((s, i) => (
                        <div key={s.key} className="flex-1">
                            <div
                                className="h-1 rounded-full"
                                style={{
                                    background:
                                        i <= step
                                            ? 'var(--wv-accent)'
                                            : 'color-mix(in srgb, currentColor 15%, transparent)',
                                }}
                            />
                            <p
                                className="mt-1 text-[10px] font-medium"
                                style={{
                                    color: i === step ? 'var(--wv-accent)' : undefined,
                                    opacity: i === step ? 1 : 0.6,
                                }}
                            >
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-5 space-y-5">
                {/* ── main: марка/модель/год (offer) или критерии (want) ── */}
                {(kind === 'want' || currentStep === 'main') && (
                    <>
                        {hasMake && (
                            <div>
                                <p className="mb-2 text-[13px] font-semibold">
                                    Марка{' '}
                                    <span style={{ color: 'var(--wv-accent)' }}>*</span>
                                </p>
                                <button type="button" onClick={() => setPicker('make')} className={selectBtn}>
                                    <span className={make ? '' : 'text-muted-foreground'}>
                                        {makeLabel ?? 'Выберите марку'}
                                    </span>
                                    <span aria-hidden className="text-muted-foreground">▾</span>
                                </button>
                            </div>
                        )}
                        {hasModel && (
                            <div>
                                <p className="mb-2 text-[13px] font-semibold">
                                    {kind === 'want' ? 'Модели (можно несколько)' : 'Модель '}
                                    {kind === 'offer' && (
                                        <span style={{ color: 'var(--wv-accent)' }}>*</span>
                                    )}
                                </p>
                                <button
                                    type="button"
                                    onClick={openModelPicker}
                                    disabled={!make}
                                    className={`${selectBtn} disabled:opacity-40`}
                                >
                                    <span className={(kind === 'want' ? models.length : model) ? '' : 'text-muted-foreground'}>
                                        {kind === 'want'
                                            ? models.length ? models.map(modelLabelOf).join(', ') : 'Любая'
                                            : model ? modelLabelOf(model) : 'Выберите модель'}
                                    </span>
                                    <span aria-hidden className="text-muted-foreground">▾</span>
                                </button>
                            </div>
                        )}
                        {hasYear && (
                            <div>
                                <p className="mb-2 text-[13px] font-semibold">
                                    {kind === 'want' ? 'Год, от' : 'Год выпуска '}
                                    {kind === 'offer' && (
                                        <span style={{ color: 'var(--wv-accent)' }}>*</span>
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
                        )}
                    </>
                )}

                {/* ── params (offer) ── */}
                {kind === 'offer' && currentStep === 'params' && (
                    <>
                        {[...requiredAttrs, ...optionalAttrs]
                            .map((a) => applyModelConstraints(a, modelConstraints))
                            .map((a) => renderAttr(a))}
                    </>
                )}

                {/* ── photos (offer) ── */}
                {kind === 'offer' && currentStep === 'photos' && (
                    <>
                        <PhotosStep photos={photos} onChange={setPhotos} />
                        {category?.min_photos_offer === 0 && (
                            <p className="text-[12px] text-muted-foreground">
                                Фото по желанию, но с ними откликаются чаще.
                            </p>
                        )}
                    </>
                )}

                {/* ── publish (offer) / хвост формы (want) ── */}
                {(kind === 'want' || currentStep === 'publish') && (
                    <>
                        <div>
                            <p className="mb-2 text-[13px] font-semibold">
                                {kind === 'want' ? 'Бюджет, до' : 'Цена'}
                                {!category?.price_optional && (
                                    <span style={{ color: 'var(--wv-accent)' }}> *</span>
                                )}
                            </p>
                            <div className="flex gap-2">
                                <NumberInput
                                    value={price}
                                    onChange={setPrice}
                                    placeholder={
                                        category?.price_optional
                                            ? 'Договорная'
                                            : currency === 'USD' ? '15 000' : '1 300 000'
                                    }
                                />
                                <div className="flex shrink-0 overflow-hidden rounded-xl border text-[13px] font-semibold">
                                    {(['USD', 'KGS'] as const).map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setCurrency(c)}
                                            className="px-3"
                                            style={currency === c ? accent(true) : undefined}
                                        >
                                            {c === 'USD' ? '$' : 'сом'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {category?.price_optional && (
                                <p className="mt-1 text-[12px] text-muted-foreground">
                                    Оставьте пустым — покажем «Договорная».
                                </p>
                            )}
                        </div>

                        {kind === 'want' &&
                            wantExtra.map((a) => renderAttr(a, true))}

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
                                        : 'Состояние, детали, что важно знать…'
                                }
                                className={`${inputCls} resize-none`}
                            />
                        </div>

                        <div>
                            <p className="mb-2 text-[13px] font-semibold">
                                Телефон для связи{' '}
                                <span style={{ color: 'var(--wv-accent)' }}>*</span>
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

            {/* нижняя панель: +22px к safe-area (во вьюве inset = 0) */}
            <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t bg-background/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+22px)] backdrop-blur">
                <button
                    onClick={() => {
                        if (kind === 'offer' && step > 0) setStep((s) => s - 1)
                        else if (category && category.kinds.length > 1)
                            setKindChosen(false) // назад к выбору стороны
                        else setCatId(null) // назад к выбору ветки
                    }}
                    className="rounded-xl border px-5 py-3 text-[14px] font-medium active:bg-muted"
                >
                    Назад
                </button>
                <button
                    disabled={!stepValid() || submitting}
                    onClick={() =>
                        kind === 'offer' && step < steps.length - 1
                            ? setStep((s) => s + 1)
                            : submit()
                    }
                    className="flex-1 rounded-xl py-3 text-[15px] font-semibold text-white active:opacity-90 disabled:opacity-40"
                    style={{ background: 'var(--wv-primary)' }}
                >
                    {submitting
                        ? 'Публикуем…'
                        : kind === 'offer' && step < steps.length - 1
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
