'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ensureAuth, initWebviewAuth } from '../../../auth'
import * as bridge from '../../../bridge'
import {
    fetchContact,
    fetchListing,
    fetchMe,
    renewListing,
    trackShare,
    updateListing,
} from '../../lib/api'
import {
    useCategoryAttributes,
    useCurrencies,
    useListingInvalidation,
    useModelOptions,
} from '../../lib/queries'
import { formatNumber, formatPrice, pickLabel, timeAgo } from '../../lib/format'
import { navigateTo } from '../../lib/nav'
import type {
    AttributeOption,
    EffectiveAttribute,
    Listing,
    ListingContact,
} from '../../lib/types'
import { PickerSheet } from '../PickerSheet'
import { PhotosStep } from '../wizard/PhotosStep'
import {
    RegionSheet,
    applyModelConstraints,
    isAttrVisible,
    modelYearRange,
} from '../wizard/fields'
import {
    ContactEditSheet,
    NumberEditSheet,
    PriceEditSheet,
    TextEditSheet,
} from './editors'

// Страница владельца: статус/срок/статистика, быстрые действия и пополевое
// редактирование — тап по строке открывает боттом-шит одного поля (паттерн
// rideshare: за раз обычно меняют одно поле, wizard для этого избыточен).

const STATUS_LABEL: Record<string, string> = {
    active: 'Опубликовано',
    archived: 'Снято с публикации',
    sold: 'Продано',
    moderation: 'На модерации',
    draft: 'Черновик',
}

type Editor =
    | { kind: 'price' }
    | { kind: 'description' }
    | { kind: 'region' }
    | { kind: 'contact' }
    | { kind: 'attr'; attr: EffectiveAttribute }
    | { kind: 'make' }
    | { kind: 'model'; forMake: string }
    | { kind: 'year' }
    | null

const YEARS: AttributeOption[] = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => {
    const y = 2026 - i
    return {
        id: y, value: String(y), label: { ru: String(y) },
        sort_order: i, brand: null, popular: false, constraints: null,
    }
})

export function OwnerClient({ id }: { id: number }) {
    const router = useRouter()
    const invalidate = useListingInvalidation()
    const [listing, setListing] = useState<Listing | null>(null)
    const [contact, setContact] = useState<ListingContact | null>(null)
    // чьи модели показывать в пикере: текущая марка или выбираемая новая
    const [modelsFor, setModelsFor] = useState<string | undefined>()
    const [editor, setEditor] = useState<Editor>(null)
    const [busy, setBusy] = useState(false)
    const [denied, setDenied] = useState(false)

    // справочники — из общего React Query-кэша
    const { data: attrs = [] } = useCategoryAttributes(
        listing?.category_id ?? null,
        'offer',
    )
    const { data: currencies = [] } = useCurrencies()
    const currencyIds = useMemo(
        () => Object.fromEntries(currencies.map((c) => [c.code, c.id])),
        [currencies],
    )
    const { data: modelOptions = [], isLoading: modelsLoading } =
        useModelOptions(modelsFor)

    useEffect(() => {
        let alive = true
        ;(async () => {
            await initWebviewAuth()
            if (!(await ensureAuth())) {
                if (alive) setDenied(true)
                return
            }
            try {
                const [l, me] = await Promise.all([fetchListing(id), fetchMe()])
                if (!alive) return
                if (l.user_id !== me.id) {
                    // не владелец — на публичную карточку
                    router.replace(`/webview/auto/${id}`)
                    return
                }
                setListing(l)
                const make = l.attributes?.make
                if (typeof make === 'string') setModelsFor(make)
                fetchContact(id) // владельцу счётчик не крутится
                    .then((c) => alive && setContact(c))
                    .catch(() => {})
            } catch {
                if (alive) setDenied(true)
            }
        })()
        return () => {
            alive = false
        }
    }, [id, router])

    const optionLabel = useMemo(() => {
        const map: Record<string, Record<string, string>> = {}
        for (const a of attrs) {
            map[a.key] = Object.fromEntries(
                a.options.map((o) => [o.value, pickLabel(o.label)]),
            )
        }
        for (const o of modelOptions) {
            ;(map.model ??= {})[o.value] = pickLabel(o.label)
        }
        return (key: string, value: string) => map[key]?.[value] ?? value
    }, [attrs, modelOptions])

    const modelConstraints = useMemo(() => {
        const m = listing?.attributes?.model
        return (
            (typeof m === 'string'
                ? modelOptions.find((o) => o.value === m)?.constraints
                : null) ?? null
        )
    }, [listing, modelOptions])

    const patch = useCallback(
        async (body: Parameters<typeof updateListing>[1]) => {
            setBusy(true)
            try {
                const updated = await updateListing(id, body)
                setListing(updated)
                invalidate(updated) // карточка/лента/«Мои» увидят правку сразу
                bridge.haptic?.('light').catch(() => {})
            } catch {
                bridge.toast?.('Не сохранилось, попробуйте ещё раз', 'warning').catch(() => {})
                throw new Error('save failed')
            } finally {
                setBusy(false)
            }
        },
        [id, invalidate],
    )

    const patchAttr = useCallback(
        async (changes: Record<string, unknown>) => {
            if (!listing) return
            const merged = { ...listing.attributes, ...changes }
            // значения полей, скрытых visible_when после правки, вычищаем
            for (const a of attrs) {
                if (a.key in merged && !isAttrVisible(a, merged)) delete merged[a.key]
            }
            await patch({ attributes: merged })
        },
        [listing, attrs, patch],
    )

    const setStatus = async (status: string) => {
        await patch({ status }).catch(() => {})
    }

    const renew = async () => {
        setBusy(true)
        try {
            const updated = await renewListing(id)
            setListing(updated)
            invalidate(updated)
            bridge.toast?.('Срок продлён', 'success').catch(() => {})
        } catch {
            bridge.toast?.('Не получилось, попробуйте ещё раз', 'warning').catch(() => {})
        } finally {
            setBusy(false)
        }
    }

    const share = () => {
        if (!listing) return
        trackShare(listing.id)
        const url = `https://go.bulbul.asia/service/auto/${listing.id}`
        if (bridge.bridgeAvailable()) bridge.share(url).catch(() => {})
        else navigator.clipboard?.writeText(url)
    }

    if (denied) {
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
                <p className="text-[17px] font-semibold">Нет доступа</p>
                <p className="mt-2 text-[14px] text-muted-foreground">
                    Управлять объявлением может только его владелец.
                </p>
            </div>
        )
    }

    if (!listing) {
        return (
            <div className="space-y-4 p-4">
                <div className="wv-skeleton h-7 w-52 rounded" />
                <div className="wv-skeleton h-24 rounded-2xl" />
                <div className="wv-skeleton h-40 rounded-2xl" />
            </div>
        )
    }

    const l = listing
    const isWant = l.kind === 'want'
    const title = typeof l.title === 'string' ? l.title : pickLabel(l.title ?? undefined)
    const expiryDays = l.expire_at
        ? Math.ceil((new Date(l.expire_at).getTime() - Date.now()) / 86_400_000)
        : null
    const attrValue = (key: string) => l.attributes?.[key]

    // строки редактируемых атрибутов (offer): каталог, visible_when, без
    // make/model/year — у них свои строки с каскадом
    const paramAttrs = attrs.filter(
        (a) =>
            a.role !== 'system' &&
            !['make', 'model', 'year'].includes(a.key) &&
            isAttrVisible(a, l.attributes ?? {}),
    )

    const row =
        'flex w-full items-center justify-between gap-3 border-t px-4 py-3.5 text-left first:border-t-0 active:bg-muted/50'
    const rowVal = 'shrink-0 max-w-[55%] truncate text-[14px] text-muted-foreground'
    const actionBtn =
        'rounded-xl border px-3.5 py-2.5 text-[13px] font-medium active:bg-muted disabled:opacity-50'

    const displayAttr = (a: EffectiveAttribute): string => {
        const v = attrValue(a.key)
        if (v === undefined || v === null || v === '') return 'Не указано'
        if (typeof v === 'boolean') return v ? 'Да' : 'Нет'
        if (a.type === 'enum') return optionLabel(a.key, String(v))
        if (a.key === 'mileage') return `${formatNumber(Number(v))} км`
        return String(v)
    }

    return (
        <div className="min-h-dvh pb-16">
            <div className="px-4 pt-4">
                <h1 className="text-[19px] font-bold leading-snug tracking-tight">
                    {title}
                </h1>
                <p className="mt-1 text-[13px] text-muted-foreground">
                    <span
                        style={
                            l.status === 'active'
                                ? { color: 'var(--wv-accent)', fontWeight: 600 }
                                : undefined
                        }
                    >
                        {STATUS_LABEL[l.status] ?? l.status}
                    </span>
                    {l.status === 'active' && expiryDays !== null && (
                        <span> · ещё {Math.max(expiryDays, 0)} дн.</span>
                    )}
                    <span> · {timeAgo(l.created_at)}</span>
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                    {l.views} просмотров · {l.contacts} показов номера
                </p>

                {/* действия */}
                <div className="wv-chips -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
                    {l.status === 'active' ? (
                        <>
                            <button disabled={busy} onClick={renew} className={actionBtn}>
                                Продлить
                            </button>
                            <button
                                disabled={busy}
                                onClick={() => setStatus('sold')}
                                className={actionBtn}
                                style={{
                                    color: 'var(--wv-accent)',
                                    borderColor: 'var(--wv-accent-border)',
                                }}
                            >
                                Продано
                            </button>
                            <button
                                disabled={busy}
                                onClick={() => setStatus('archived')}
                                className={actionBtn}
                            >
                                Снять
                            </button>
                        </>
                    ) : (
                        <button disabled={busy} onClick={renew} className={actionBtn}>
                            Опубликовать снова
                        </button>
                    )}
                    <button onClick={share} className={actionBtn}>
                        Поделиться
                    </button>
                    <button
                        onClick={() =>
                            navigateTo(router, `/webview/auto/${l.id}`, title)
                        }
                        className={actionBtn}
                    >
                        Как покупатель
                    </button>
                </div>
            </div>

            {/* фото: правки сохраняются сразу */}
            {!isWant && (
                <section className="mt-5 px-4">
                    <h2 className="mb-2 text-[15px] font-semibold">Фото</h2>
                    <PhotosStep
                        photos={l.photos}
                        onChange={(p) => {
                            if (p.length === 0) {
                                bridge.toast?.('Нужно минимум 1 фото', 'warning').catch(() => {})
                                return
                            }
                            void patch({ photos: p }).catch(() => {})
                        }}
                    />
                </section>
            )}

            {/* основное */}
            <section className="mt-5">
                <h2 className="mb-2 px-4 text-[15px] font-semibold">Основное</h2>
                <div className="border-y">
                    <button className={row} onClick={() => setEditor({ kind: 'price' })}>
                        <span className="text-[14px]">{isWant ? 'Бюджет, до' : 'Цена'}</span>
                        <span className={`${rowVal} font-mono font-semibold text-foreground`}>
                            {formatPrice(l.price, l.currency_code)}
                        </span>
                    </button>
                    <button
                        className={row}
                        onClick={() => setEditor({ kind: 'description' })}
                    >
                        <span className="text-[14px]">Описание</span>
                        <span className={rowVal}>
                            {l.description?.trim() ? l.description : 'Не указано'}
                        </span>
                    </button>
                    <button className={row} onClick={() => setEditor({ kind: 'region' })}>
                        <span className="text-[14px]">Город / регион</span>
                        <span className={rowVal}>{l.region_name ?? 'Не указан'}</span>
                    </button>
                    <button className={row} onClick={() => setEditor({ kind: 'contact' })}>
                        <span className="text-[14px]">Контакты</span>
                        <span className={`${rowVal} font-mono`}>
                            {contact?.phone ?? '…'}
                            {contact?.whatsapp ? ' · WA' : ''}
                        </span>
                    </button>
                </div>
            </section>

            {/* параметры (только продажа) */}
            {!isWant && (
                <section className="mt-5">
                    <h2 className="mb-2 px-4 text-[15px] font-semibold">Параметры</h2>
                    <div className="border-y">
                        <button className={row} onClick={() => setEditor({ kind: 'make' })}>
                            <span className="text-[14px]">Марка</span>
                            <span className={rowVal}>
                                {optionLabel('make', String(attrValue('make') ?? ''))}
                            </span>
                        </button>
                        <button
                            className={row}
                            onClick={() => {
                                const make = attrValue('make')
                                if (typeof make === 'string') {
                                    setEditor({ kind: 'model', forMake: make })
                                }
                            }}
                        >
                            <span className="text-[14px]">Модель</span>
                            <span className={rowVal}>
                                {optionLabel('model', String(attrValue('model') ?? ''))}
                            </span>
                        </button>
                        <button className={row} onClick={() => setEditor({ kind: 'year' })}>
                            <span className="text-[14px]">Год выпуска</span>
                            <span className={rowVal}>{String(attrValue('year') ?? '—')}</span>
                        </button>

                        {paramAttrs.map((a) =>
                            a.type === 'bool' ? (
                                <button
                                    key={a.key}
                                    className={row}
                                    disabled={busy}
                                    onClick={() =>
                                        void patchAttr({
                                            [a.key]: !attrValue(a.key),
                                        }).catch(() => {})
                                    }
                                >
                                    <span className="text-[14px]">{pickLabel(a.label)}</span>
                                    <span
                                        aria-hidden
                                        className="relative h-6 w-10 shrink-0 rounded-full transition-colors"
                                        style={{
                                            background: attrValue(a.key)
                                                ? 'var(--wv-accent)'
                                                : 'color-mix(in srgb, currentColor 20%, transparent)',
                                        }}
                                    >
                                        <span
                                            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                                            style={{
                                                left: attrValue(a.key)
                                                    ? 'calc(100% - 1.375rem)'
                                                    : '0.125rem',
                                            }}
                                        />
                                    </span>
                                </button>
                            ) : (
                                <button
                                    key={a.key}
                                    className={row}
                                    onClick={() => setEditor({ kind: 'attr', attr: a })}
                                >
                                    <span className="text-[14px]">
                                        {pickLabel(a.label)}
                                        {a.unit ? (
                                            <span className="text-muted-foreground">
                                                , {pickLabel(a.unit)}
                                            </span>
                                        ) : null}
                                    </span>
                                    <span className={rowVal}>{displayAttr(a)}</span>
                                </button>
                            ),
                        )}
                    </div>
                </section>
            )}

            {/* ── шиты редактирования ── */}
            <PriceEditSheet
                open={editor?.kind === 'price'}
                onClose={() => setEditor(null)}
                title={isWant ? 'Бюджет, до' : 'Цена'}
                initialAmount={l.price ?? undefined}
                initialCurrency={l.currency_code === 'KGS' ? 'KGS' : 'USD'}
                onSave={async (amount, cur) =>
                    patch({ price: amount, currency_id: currencyIds[cur] })
                }
            />
            <TextEditSheet
                open={editor?.kind === 'description'}
                onClose={() => setEditor(null)}
                title="Описание"
                initial={l.description ?? ''}
                placeholder="Состояние, комплектация, что менялось…"
                onSave={async (v) => patch({ description: v })}
            />
            <RegionSheet
                open={editor?.kind === 'region'}
                onClose={() => setEditor(null)}
                onPick={(r) => void patch({ region_id: r.id }).catch(() => {})}
            />
            <ContactEditSheet
                open={editor?.kind === 'contact'}
                onClose={() => setEditor(null)}
                initialPhone={contact?.phone ?? ''}
                initialWhatsapp={contact?.whatsapp ?? false}
                onSave={async (phone, whatsapp) => {
                    await patch({ phone, whatsapp })
                    setContact({ ...(contact ?? { name: null, telegram: null }), phone, whatsapp })
                }}
            />

            {/* числовые/enum атрибуты */}
            <NumberEditSheet
                open={editor?.kind === 'attr' && editor.attr.type !== 'enum'}
                onClose={() => setEditor(null)}
                title={editor?.kind === 'attr' ? pickLabel(editor.attr.label) : ''}
                unit={
                    editor?.kind === 'attr' && editor.attr.unit
                        ? pickLabel(editor.attr.unit)
                        : undefined
                }
                decimal={editor?.kind === 'attr' && editor.attr.type === 'decimal'}
                initial={
                    editor?.kind === 'attr'
                        ? (attrValue(editor.attr.key) as number | undefined)
                        : undefined
                }
                onSave={async (v) => {
                    if (editor?.kind === 'attr') await patchAttr({ [editor.attr.key]: v })
                }}
            />
            <PickerSheet
                open={editor?.kind === 'attr' && editor.attr.type === 'enum'}
                onClose={() => setEditor(null)}
                title={editor?.kind === 'attr' ? pickLabel(editor.attr.label) : ''}
                options={
                    editor?.kind === 'attr'
                        ? applyModelConstraints(editor.attr, modelConstraints).options
                        : []
                }
                selected={
                    editor?.kind === 'attr'
                        ? [String(attrValue(editor.attr.key) ?? '')]
                        : []
                }
                onApply={([v]) => {
                    if (editor?.kind === 'attr' && v) {
                        void patchAttr({ [editor.attr.key]: v }).catch(() => {})
                    }
                }}
            />

            {/* марка → модель (каскад) и год с constraints */}
            <PickerSheet
                open={editor?.kind === 'make'}
                onClose={() => setEditor(null)}
                title="Марка"
                options={attrs.find((a) => a.key === 'make')?.options ?? []}
                selected={[String(attrValue('make') ?? '')]}
                onApply={([v]) => {
                    if (!v || v === attrValue('make')) return
                    // смена марки требует выбрать модель — PATCH уйдёт вместе
                    setModelsFor(v)
                    setEditor({ kind: 'model', forMake: v })
                }}
            />
            <PickerSheet
                open={editor?.kind === 'model'}
                onClose={() => setEditor(null)}
                title="Модель"
                options={modelOptions}
                loading={modelsLoading}
                selected={[String(attrValue('model') ?? '')]}
                onApply={([v]) => {
                    if (!v || editor?.kind !== 'model') return
                    void patchAttr({ make: editor.forMake, model: v }).catch(() => {})
                }}
            />
            <PickerSheet
                open={editor?.kind === 'year'}
                onClose={() => setEditor(null)}
                title="Год выпуска"
                options={(() => {
                    const r = modelYearRange(modelConstraints)
                    if (!r) return YEARS
                    return YEARS.filter((y) => {
                        const n = Number(y.value)
                        return (
                            (r.min === undefined || n >= r.min) &&
                            (r.max === undefined || n <= r.max)
                        )
                    })
                })()}
                selected={[String(attrValue('year') ?? '')]}
                onApply={([v]) => {
                    if (v) void patchAttr({ year: Number(v) }).catch(() => {})
                }}
            />
        </div>
    )
}
