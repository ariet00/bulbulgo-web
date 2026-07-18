'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    fetchCategories,
    fetchCategoryAttributes,
    fetchListings,
    fetchModelOptions,
    fetchRates,
} from '../lib/api'
import { pickLabel } from '../lib/format'
import type {
    AttributeOption,
    EffectiveAttribute,
    Listing,
    ListingFilters,
    ListingKind,
} from '../lib/types'
import { BottomSheet } from './BottomSheet'
import { ListingCard, ListingCardSkeleton } from './ListingCard'
import { PickerSheet } from './PickerSheet'
import {
    FilterSheet,
    countActiveFilters,
    draftToFilters,
    emptyDraft,
    type FilterDraft,
} from './FilterSheet'

// Экран ленты авторынка: сегмент Продажа|Куплю, чипсы Марка/Модель/Фильтры,
// бесконечная лента карточек, FAB подачи. Каталог (категория auto.cars,
// атрибуты, курсы) грузится один раз при входе.

const PAGE = 20

type SheetName = 'make' | 'model' | 'filters' | 'sort' | null

type SortValue = NonNullable<ListingFilters['sort']>

const SORTS: [SortValue, string][] = [
    ['fresh', 'Сначала свежие'],
    ['price_asc', 'Дешевле'],
    ['price_desc', 'Дороже'],
    ['year_desc', 'Год: новее'],
    ['mileage_asc', 'Пробег: меньше'],
]

export function MarketClient() {
    const router = useRouter()

    // ── каталог ──
    const [carsId, setCarsId] = useState<number | null>(null)
    const [attrs, setAttrs] = useState<EffectiveAttribute[]>([])
    const [rates, setRates] = useState<Record<string, number>>({})
    const [catalogError, setCatalogError] = useState(false)

    // ── фильтры ──
    const [kind, setKind] = useState<ListingKind>('offer')
    const [make, setMake] = useState<string | undefined>()
    const [models, setModels] = useState<string[]>([])
    const [draft, setDraft] = useState<FilterDraft>(emptyDraft())
    const [sort, setSort] = useState<SortValue>('fresh')
    const [sheet, setSheet] = useState<SheetName>(null)
    const modelCache = useRef<Record<string, AttributeOption[]>>({})
    const [modelOptions, setModelOptions] = useState<AttributeOption[]>([])
    const [modelsLoading, setModelsLoading] = useState(false)

    // ── лента ──
    const [items, setItems] = useState<Listing[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [feedError, setFeedError] = useState(false)

    useEffect(() => {
        let alive = true
        Promise.all([fetchCategories(), fetchRates()])
            .then(async ([tree, r]) => {
                if (!alive) return
                setRates(r)
                const auto = tree.find((c) => c.slug === 'auto')
                const cars = auto?.children.find((c) => c.slug === 'cars')
                if (!cars) {
                    setCatalogError(true)
                    return
                }
                setCarsId(cars.id)
                setAttrs(await fetchCategoryAttributes(cars.id))
            })
            .catch(() => alive && setCatalogError(true))
        return () => {
            alive = false
        }
    }, [])

    const makeOptions = useMemo(
        () => attrs.find((a) => a.key === 'make')?.options ?? [],
        [attrs],
    )
    const optionLabel = useCallback(
        (key: string, value: string) => {
            const opt = attrs
                .find((a) => a.key === key)
                ?.options.find((o) => o.value === value)
            return opt ? pickLabel(opt.label) : value
        },
        [attrs],
    )
    const makeLabel = make
        ? pickLabel(makeOptions.find((o) => o.value === make)?.label) || make
        : null

    const filters = useMemo(
        () => ({ ...draftToFilters(draft, kind, { make, models }), sort }),
        [draft, kind, make, models, sort],
    )

    // загрузка ленты (сброс при смене фильтров)
    useEffect(() => {
        if (carsId === null) return
        let alive = true
        setLoading(true)
        setFeedError(false)
        fetchListings(carsId, filters, 0, PAGE)
            .then((page) => {
                if (!alive) return
                setItems(page.items)
                setTotal(page.total)
            })
            .catch(() => alive && setFeedError(true))
            .finally(() => alive && setLoading(false))
        return () => {
            alive = false
        }
    }, [carsId, filters])

    const loadingMore = useRef(false)
    const loadMore = useCallback(async () => {
        if (carsId === null || loadingMore.current) return
        if (items.length >= total) return
        loadingMore.current = true
        try {
            const page = await fetchListings(carsId, filters, items.length, PAGE)
            setItems((prev) => [...prev, ...page.items])
            setTotal(page.total)
        } catch {
            /* тихо: следующий скролл повторит */
        } finally {
            loadingMore.current = false
        }
    }, [carsId, filters, items.length, total])

    // бесконечная прокрутка
    const sentinel = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = sentinel.current
        if (!el) return
        const io = new IntersectionObserver(
            (entries) => entries[0].isIntersecting && loadMore(),
            { rootMargin: '600px' },
        )
        io.observe(el)
        return () => io.disconnect()
    }, [loadMore])

    const openModelPicker = async () => {
        if (!make) return
        setSheet('model')
        if (modelCache.current[make]) {
            setModelOptions(modelCache.current[make])
            return
        }
        setModelsLoading(true)
        try {
            const opts = await fetchModelOptions(make)
            modelCache.current[make] = opts
            setModelOptions(opts)
        } finally {
            setModelsLoading(false)
        }
    }

    const countResults = useCallback(
        async (d: FilterDraft) => {
            if (carsId === null) return 0
            const page = await fetchListings(
                carsId,
                draftToFilters(d, kind, { make, models }),
                0,
                1,
            )
            return page.total
        },
        [carsId, kind, make, models],
    )

    const activeCount = countActiveFilters(draft)

    if (catalogError) {
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
                <p className="text-[17px] font-semibold">Сервис недоступен</p>
                <p className="mt-2 text-[14px] text-muted-foreground">
                    Не удалось загрузить каталог. Проверьте соединение и
                    попробуйте ещё раз.
                </p>
            </div>
        )
    }

    const chip =
        'shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-medium active:bg-muted transition-colors'
    const chipActive = {
        background: 'var(--am-accent-soft)',
        borderColor: 'var(--am-accent-border)',
        color: 'var(--am-accent)',
    } as React.CSSProperties

    return (
        <div className="min-h-dvh pb-24">
            {/* сегмент рынка */}
            <div className="sticky top-0 z-20 border-b bg-background/95 px-4 pb-2.5 pt-3 backdrop-blur">
                <div className="flex rounded-xl bg-muted/60 p-1 text-[14px] font-semibold">
                    {(
                        [
                            ['offer', 'Продажа'],
                            ['want', 'Куплю'],
                        ] as const
                    ).map(([k, label]) => (
                        <button
                            key={k}
                            onClick={() => setKind(k)}
                            className="flex-1 rounded-[10px] py-1.5 transition-colors"
                            style={
                                kind === k
                                    ? {
                                          background: 'var(--am-accent)',
                                          color: '#fff',
                                      }
                                    : { color: 'inherit', opacity: 0.7 }
                            }
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* чипсы фильтров */}
                <div className="am-chips -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4">
                    <button
                        className={chip}
                        style={make ? chipActive : undefined}
                        onClick={() => setSheet('make')}
                    >
                        {makeLabel ?? 'Марка'} ▾
                    </button>
                    <button
                        className={`${chip} disabled:opacity-40`}
                        style={models.length ? chipActive : undefined}
                        disabled={!make}
                        onClick={openModelPicker}
                    >
                        {models.length
                            ? `Модель (${models.length})`
                            : 'Модель'}{' '}
                        ▾
                    </button>
                    <button
                        className={chip}
                        style={activeCount ? chipActive : undefined}
                        onClick={() => setSheet('filters')}
                    >
                        Фильтры{activeCount ? ` · ${activeCount}` : ''}
                    </button>
                    <button
                        className={chip}
                        style={sort !== 'fresh' ? chipActive : undefined}
                        onClick={() => setSheet('sort')}
                    >
                        {SORTS.find(([v]) => v === sort)?.[1]} ▾
                    </button>
                    <button
                        className={chip}
                        onClick={() =>
                            router.push('/webview/auto_market/favorites')
                        }
                    >
                        ♥ Избранное
                    </button>
                    <button
                        className={chip}
                        onClick={() => router.push('/webview/auto_market/my')}
                    >
                        Мои
                    </button>
                </div>
            </div>

            {/* лента */}
            <div className="space-y-3 px-4 pt-3">
                {!loading && !feedError && total > 0 && (
                    <p className="text-[12px] text-muted-foreground">
                        {total} объявлений
                    </p>
                )}

                {loading ? (
                    <>
                        <ListingCardSkeleton />
                        <ListingCardSkeleton />
                        <ListingCardSkeleton />
                    </>
                ) : feedError ? (
                    <p className="py-16 text-center text-[14px] text-muted-foreground">
                        Не удалось загрузить объявления
                    </p>
                ) : items.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-[16px] font-semibold">
                            {kind === 'offer'
                                ? 'Пока нет объявлений'
                                : 'Пока нет запросов «куплю»'}
                        </p>
                        <p className="mt-1.5 text-[14px] text-muted-foreground">
                            {activeCount || make
                                ? 'Попробуйте смягчить фильтры'
                                : 'Станьте первым — подайте объявление'}
                        </p>
                    </div>
                ) : (
                    items.map((l, i) => (
                        <ListingCard
                            key={l.id}
                            listing={l}
                            rates={rates}
                            optionLabel={optionLabel}
                            delayMs={Math.min((i % PAGE) * 40, 320)}
                            onOpen={(x) =>
                                router.push(`/webview/auto_market/${x.id}`)
                            }
                        />
                    ))
                )}
                <div ref={sentinel} />
            </div>

            {/* FAB подачи */}
            <button
                onClick={() =>
                    router.push(
                        kind === 'want'
                            ? '/webview/auto_market/new?kind=want'
                            : '/webview/auto_market/new',
                    )
                }
                className="fixed bottom-6 right-4 z-30 flex items-center gap-2 rounded-full px-5 py-3.5 text-[15px] font-semibold text-white shadow-lg active:scale-95 transition-transform"
                style={{ background: 'var(--am-accent)' }}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M8 2v12M2 8h12" />
                </svg>
                Подать
            </button>

            {/* шиты */}
            <PickerSheet
                open={sheet === 'make'}
                onClose={() => setSheet(null)}
                title="Марка"
                options={makeOptions}
                selected={make ? [make] : []}
                onApply={([v]) => {
                    if (v !== make) setModels([])
                    setMake(v)
                }}
            />
            <PickerSheet
                open={sheet === 'model'}
                onClose={() => setSheet(null)}
                title={makeLabel ? `Модели ${makeLabel}` : 'Модель'}
                options={modelOptions}
                loading={modelsLoading}
                selected={models}
                multi
                onApply={setModels}
            />
            <FilterSheet
                open={sheet === 'filters'}
                onClose={() => setSheet(null)}
                attributes={attrs}
                draft={draft}
                onApply={setDraft}
                countResults={countResults}
            />
            <BottomSheet
                open={sheet === 'sort'}
                onClose={() => setSheet(null)}
                title="Сортировка"
            >
                {SORTS.map(([value, label]) => (
                    <button
                        key={value}
                        onClick={() => {
                            setSort(value)
                            setSheet(null)
                        }}
                        className="flex w-full items-center justify-between border-t py-3 text-left text-[15px] first:border-t-0"
                        style={
                            sort === value
                                ? { color: 'var(--am-accent)', fontWeight: 600 }
                                : undefined
                        }
                    >
                        {label}
                        {sort === value && (
                            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M2 6.5L4.8 9 10 3.5" />
                            </svg>
                        )}
                    </button>
                ))}
            </BottomSheet>
        </div>
    )
}
