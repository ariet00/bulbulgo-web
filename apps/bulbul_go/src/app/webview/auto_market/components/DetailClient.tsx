'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ensureAuth, initWebviewAuth, trySilentAuth } from '../../auth'
import * as bridge from '../../bridge'
import {
    addFavorite,
    complain,
    fetchComplaintReasons,
    fetchContact,
    fetchFavoriteIds,
    fetchMe,
    removeFavorite,
    trackShare,
    trackView,
    type ComplaintReason,
} from '../lib/api'
import {
    formatNumber,
    formatPrice,
    formatPriceAlt,
    pickLabel,
    timeAgo,
} from '../lib/format'
import {
    useCategoryAttributes,
    useListing,
    useModelOptions,
    useRates,
    useRelated,
} from '../lib/queries'
import type { EffectiveAttribute, ListingContact } from '../lib/types'
import { navigateTo } from '../lib/nav'
import { BottomSheet } from './BottomSheet'
import { ListingCard } from './ListingCard'

// Страница объявления: галерея, цена в обеих валютах, таблица характеристик,
// описание, контакты за кнопкой («Показать контакты» = наш contact-эндпоинт
// со счётчиком), избранное, похожие (offer) / подходящие предложения (want).
// Данные — React Query: карточка рисуется мгновенно из кэша ленты (SWR),
// справочники — из общего кэша.

export function DetailClient({ id }: { id: number }) {
    const router = useRouter()
    const listingQ = useListing(id)
    const listing = listingQ.data ?? null
    const error = listingQ.isError
    const { data: attrs = [] } = useCategoryAttributes(
        listing?.category_id ?? null,
    )
    const make = listing?.attributes?.make
    const { data: modelOpts = [] } = useModelOptions(
        typeof make === 'string' ? make : undefined,
    )
    const { data: rates = {} } = useRates()
    const { data: related = [] } = useRelated(id, listing?.kind)

    const [fav, setFav] = useState(false)
    const [contact, setContact] = useState<ListingContact | null>(null)
    const [contactLoading, setContactLoading] = useState(false)
    const [photoIdx, setPhotoIdx] = useState(0)
    const [galleryAt, setGalleryAt] = useState<number | null>(null)
    const [isOwner, setIsOwner] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [complaintOpen, setComplaintOpen] = useState(false)
    const [reasons, setReasons] = useState<ComplaintReason[]>([])
    const [complaintSent, setComplaintSent] = useState(false)

    // просмотр — один раз на открытие
    useEffect(() => trackView(id), [id])

    // избранное/владелец — тихо, если есть сессия (imperативно: зависит от
    // асинхронной авторизации через мост)
    const ownerOf = listing?.user_id
    useEffect(() => {
        let alive = true
        ;(async () => {
            await initWebviewAuth()
            if (!(await trySilentAuth()) || !alive) return
            fetchFavoriteIds()
                .then((ids) => alive && setFav(ids.includes(id)))
                .catch(() => {})
            if (ownerOf !== undefined) {
                fetchMe()
                    .then((me) => alive && setIsOwner(me.id === ownerOf))
                    .catch(() => {})
            }
        })()
        return () => {
            alive = false
        }
    }, [id, ownerOf])

    const optionLabel = useMemo(() => {
        const map: Record<string, Record<string, string>> = {}
        for (const a of attrs) {
            map[a.key] = Object.fromEntries(
                a.options.map((o) => [o.value, pickLabel(o.label)]),
            )
        }
        for (const o of modelOpts) {
            ;(map.model ??= {})[o.value] = pickLabel(o.label)
        }
        return (key: string, value: string) => map[key]?.[value] ?? value
    }, [attrs, modelOpts])

    // критерий want / скаляр offer → человекочитаемое значение
    const formatValue = (a: EffectiveAttribute, v: unknown): string => {
        if (v == null) return ''
        if (Array.isArray(v)) {
            return v.map((x) => optionLabel(a.key, String(x))).join(', ')
        }
        if (typeof v === 'object') {
            const r = v as { min?: number; max?: number }
            const parts: string[] = []
            if (r.min !== undefined) parts.push(`от ${formatNumber(r.min)}`)
            if (r.max !== undefined) parts.push(`до ${formatNumber(r.max)}`)
            return parts.join(' ')
        }
        if (typeof v === 'boolean') return v ? 'Да' : 'Нет'
        if (a.type === 'enum' || a.type === 'multi_enum') {
            return optionLabel(a.key, String(v))
        }
        if (a.type === 'int' && a.key === 'mileage') {
            return formatNumber(Number(v))
        }
        return String(v)
    }

    const specRows = useMemo(() => {
        if (!listing) return []
        return attrs
            .filter((a) => a.role !== 'system')
            .map((a) => ({
                key: a.key,
                label: pickLabel(a.label),
                unit: a.unit ? pickLabel(a.unit) : '',
                value: formatValue(a, listing.attributes?.[a.key]),
            }))
            .filter((r) => r.value !== '')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attrs, listing, optionLabel])

    const toggleFav = async () => {
        if (!listing) return
        if (!(await ensureAuth())) return
        bridge.haptic?.('light').catch(() => {})
        setFav((f) => !f)
        try {
            if (fav) await removeFavorite(listing.id)
            else await addFavorite(listing.id)
        } catch {
            setFav((f) => !f) // откат при сетевой ошибке
        }
    }

    const revealContact = async () => {
        if (!listing || contact || contactLoading) return null
        if (!(await ensureAuth())) return null
        setContactLoading(true)
        try {
            const c = await fetchContact(listing.id)
            setContact(c)
            return c
        } catch {
            return null
        } finally {
            setContactLoading(false)
        }
    }

    const callSeller = async () => {
        const c = contact ?? (await revealContact())
        if (!c?.phone) return
        if (bridge.bridgeAvailable()) bridge.callPhone(c.phone).catch(() => {})
        else window.location.href = `tel:${c.phone}`
    }

    const openWhatsApp = async () => {
        const c = contact ?? (await revealContact())
        if (!c?.phone) return
        const url = `https://wa.me/${c.phone.replace(/\D/g, '')}`
        if (bridge.bridgeAvailable()) bridge.openUrl(url).catch(() => {})
        else window.open(url, '_blank')
    }

    const openComplaint = async () => {
        setComplaintOpen(true)
        if (!reasons.length) {
            fetchComplaintReasons()
                .then(setReasons)
                .catch(() => setReasons([{ id: 0, text: 'Другое' }]))
        }
    }

    const sendComplaint = async (reason: string) => {
        if (!listing) return
        if (!(await ensureAuth())) return
        try {
            await complain(listing.id, reason)
            setComplaintSent(true)
            bridge.toast?.('Жалоба отправлена', 'success').catch(() => {})
        } catch {
            bridge.toast?.('Не получилось, попробуйте ещё раз', 'warning').catch(() => {})
        } finally {
            setComplaintOpen(false)
        }
    }

    const shareListing = () => {
        if (!listing) return
        trackShare(listing.id)
        // публичная share-страница с OG-превью (см. src/app/auto/[id])
        const url = `https://go.bulbul.asia/auto/${listing.id}`
        if (bridge.bridgeAvailable()) bridge.share(url).catch(() => {})
        else if (navigator.share) navigator.share({ url }).catch(() => {})
        else navigator.clipboard?.writeText(url)
    }

    if (error) {
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
                <p className="text-[17px] font-semibold">
                    Объявление не найдено
                </p>
                <p className="mt-2 text-[14px] text-muted-foreground">
                    Возможно, его сняли с публикации.
                </p>
                <button
                    onClick={() => router.back()}
                    className="mt-6 rounded-xl border px-5 py-2.5 text-[14px] font-medium"
                >
                    Назад
                </button>
            </div>
        )
    }

    if (!listing) {
        return (
            <div className="space-y-4 p-4">
                <div className="am-skeleton aspect-[4/3] w-full rounded-2xl" />
                <div className="am-skeleton h-7 w-40 rounded" />
                <div className="am-skeleton h-5 w-64 rounded" />
                <div className="am-skeleton h-40 w-full rounded-2xl" />
            </div>
        )
    }

    const l = listing
    const title = typeof l.title === 'string' ? l.title : pickLabel(l.title ?? undefined)
    const alt = formatPriceAlt(l.price, l.currency_code, rates)
    const inactive = l.status !== 'active'
    const isWant = l.kind === 'want'

    return (
        <div className="min-h-dvh pb-28">
            {/* галерея */}
            {l.photos.length > 0 && (
                <div className="relative">
                    <div
                        className="am-chips flex snap-x snap-mandatory overflow-x-auto"
                        onScroll={(e) => {
                            const el = e.currentTarget
                            setPhotoIdx(
                                Math.round(el.scrollLeft / el.clientWidth),
                            )
                        }}
                    >
                        {l.photos.map((p, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={p.url}
                                src={p.url}
                                alt=""
                                onClick={() => setGalleryAt(i)}
                                className="aspect-[4/3] w-full shrink-0 snap-center object-cover"
                            />
                        ))}
                    </div>
                    {l.photos.length > 1 && (
                        <span className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-0.5 font-mono text-[12px] text-white">
                            {photoIdx + 1}/{l.photos.length}
                        </span>
                    )}
                </div>
            )}

            <div className="px-4 pt-4">
                {isOwner && (
                    <button
                        onClick={() =>
                            navigateTo(
                                router,
                                `/webview/auto_market/my/${l.id}`,
                                'Управление объявлением',
                            )
                        }
                        className="mb-3 flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-[13px] font-medium"
                        style={{
                            color: 'var(--am-accent)',
                            borderColor: 'var(--am-accent-border)',
                            background: 'var(--am-accent-soft)',
                        }}
                    >
                        Это ваше объявление — управлять
                        <span aria-hidden>›</span>
                    </button>
                )}
                {inactive && (
                    <div className="mb-3 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium text-muted-foreground">
                        Объявление снято с публикации
                    </div>
                )}

                {isWant && (
                    <span
                        className="mb-2 inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                        style={{
                            color: 'var(--am-accent)',
                            borderColor: 'var(--am-accent-border)',
                            background: 'var(--am-accent-soft)',
                        }}
                    >
                        Куплю
                    </span>
                )}

                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="font-mono text-[24px] font-bold tracking-tight">
                            {isWant && l.price != null ? 'до ' : ''}
                            {formatPrice(l.price, l.currency_code)}
                        </p>
                        {alt && (
                            <p className="font-mono text-[13px] text-muted-foreground">
                                {alt}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <IconBtn
                            onClick={toggleFav}
                            label="В избранное"
                            active={fav}
                        >
                            <path d="M8 13.6C5 11.4 1.8 8.9 1.8 5.9a3.4 3.4 0 0 1 6.2-2 3.4 3.4 0 0 1 6.2 2c0 3-3.2 5.5-6.2 7.7Z" />
                        </IconBtn>
                        <IconBtn onClick={() => setMenuOpen(true)} label="Ещё">
                            <>
                                <circle cx="3" cy="8" r="1.3" fill="currentColor" stroke="none" />
                                <circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none" />
                                <circle cx="13" cy="8" r="1.3" fill="currentColor" stroke="none" />
                            </>
                        </IconBtn>
                    </div>
                </div>

                <h1 className="mt-1.5 text-[19px] font-semibold leading-snug">
                    {title}
                </h1>
                <p className="mt-1 text-[12px] text-muted-foreground">
                    {l.region_name ? `${l.region_name} · ` : ''}
                    {timeAgo(l.created_at)}
                </p>

                {/* характеристики / критерии */}
                {specRows.length > 0 && (
                    <section className="mt-5">
                        <h2 className="text-[15px] font-semibold">
                            {isWant ? 'Что ищут' : 'Характеристики'}
                        </h2>
                        <dl className="mt-2">
                            {specRows.map((r) => (
                                <div
                                    key={r.key}
                                    className="flex justify-between gap-4 border-t py-2.5 text-[14px]"
                                >
                                    <dt className="text-muted-foreground">
                                        {r.label}
                                    </dt>
                                    <dd className="text-right font-medium">
                                        {r.value}
                                        {r.unit ? ` ${r.unit}` : ''}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                )}

                {l.description && (
                    <section className="mt-5">
                        <h2 className="text-[15px] font-semibold">Описание</h2>
                        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">
                            {l.description}
                        </p>
                    </section>
                )}

                {/* продавец */}
                <section className="mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-bold text-white"
                        style={{ background: 'var(--am-accent)' }}
                    >
                        {(l.user_name ?? '·').slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold">
                            {l.company_name ?? l.user_name ?? 'Продавец'}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                            {l.company_name ? 'Автобизнес' : 'Частное лицо'}
                        </p>
                    </div>
                </section>

                {/* жалоба — канал сигналов пост-модерации (не на своё) */}
                {!isOwner && (
                    <button
                        onClick={openComplaint}
                        disabled={complaintSent}
                        className="mx-auto mt-6 block rounded-xl border border-red-500/30 px-6 py-2.5 text-center text-[14px] font-medium text-red-500 active:bg-red-500/10 disabled:opacity-60"
                    >
                        {complaintSent ? 'Жалоба отправлена' : 'Пожаловаться'}
                    </button>
                )}

                {/* похожие / подходящие */}
                {related.length > 0 && (
                    <section className="mt-6">
                        <h2 className="text-[15px] font-semibold">
                            {isWant
                                ? 'Подходящие предложения'
                                : 'Похожие объявления'}
                        </h2>
                        <div className="mt-3 space-y-3">
                            {related.map((r) => (
                                <ListingCard
                                    key={r.id}
                                    listing={r}
                                    rates={rates}
                                    optionLabel={optionLabel}
                                    onOpen={(x) =>
                                        navigateTo(
                                            router,
                                            `/webview/auto_market/${x.id}`,
                                            typeof x.title === 'string' ? x.title : undefined,
                                        )
                                    }
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* полноэкранная галерея */}
            {galleryAt !== null && l.photos.length > 0 && (
                <div className="fixed inset-0 z-50 flex flex-col bg-black">
                    <button
                        onClick={() => setGalleryAt(null)}
                        aria-label="Закрыть"
                        className="absolute right-4 top-[calc(env(safe-area-inset-top)+12px)] z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                            <path d="M3 3l10 10M13 3L3 13" />
                        </svg>
                    </button>
                    <div
                        ref={(el) => {
                            // открываемся сразу на тапнутом фото
                            if (el && galleryAt > 0) {
                                el.scrollLeft = el.clientWidth * galleryAt
                            }
                        }}
                        onScroll={(e) => {
                            const el = e.currentTarget
                            setPhotoIdx(Math.round(el.scrollLeft / el.clientWidth))
                        }}
                        className="am-chips flex flex-1 snap-x snap-mandatory items-center overflow-x-auto"
                    >
                        {l.photos.map((p) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={p.url}
                                src={p.url}
                                alt=""
                                className="h-full w-full shrink-0 snap-center object-contain"
                            />
                        ))}
                    </div>
                    <p className="pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3 text-center font-mono text-[13px] text-white/80">
                        {photoIdx + 1} / {l.photos.length}
                    </p>
                </div>
            )}

            {/* меню «⋯»: доп. действия */}
            <BottomSheet
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                title="Действия"
            >
                <button
                    onClick={() => {
                        setMenuOpen(false)
                        shareListing()
                    }}
                    className="flex w-full items-center gap-3 py-3.5 text-left text-[15px]"
                >
                    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
                        <path d="M12 5.5a2 2 0 1 0-1.9-2.6L5.9 5a2 2 0 1 0 0 3l4.2 2.1a2 2 0 1 0 .7-1.4L6.9 6.9a2 2 0 0 0 0-.8l3.9-2a2 2 0 0 0 1.2.4Z" />
                    </svg>
                    Поделиться
                </button>
                {!isOwner && (
                    <button
                        onClick={() => {
                            setMenuOpen(false)
                            void openComplaint()
                        }}
                        disabled={complaintSent}
                        className="flex w-full items-center gap-3 border-t py-3.5 text-left text-[15px] text-red-500 disabled:opacity-60"
                    >
                        <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M3 14.5V2.3M3 2.5c2.8-1.6 5.4 1.4 8.6 0v6.4c-3.2 1.4-5.8-1.6-8.6 0" />
                        </svg>
                        {complaintSent ? 'Жалоба отправлена' : 'Пожаловаться'}
                    </button>
                )}
            </BottomSheet>

            {/* жалоба: выбор причины */}
            <BottomSheet
                open={complaintOpen}
                onClose={() => setComplaintOpen(false)}
                title="Пожаловаться"
            >
                {reasons.length === 0 ? (
                    <div className="space-y-3 py-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="am-skeleton h-6 rounded" />
                        ))}
                    </div>
                ) : (
                    reasons.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => sendComplaint(r.text)}
                            className="block w-full border-t py-3.5 text-left text-[15px] first:border-t-0"
                        >
                            {r.text}
                        </button>
                    ))
                )}
            </BottomSheet>

            {/* контактная панель */}
            {!inactive && (
                <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+22px)] backdrop-blur">
                    {contact?.phone && (
                        <p className="pb-2 text-center font-mono text-[15px] font-semibold">
                            {contact.phone}
                        </p>
                    )}
                    <div className="flex gap-2.5">
                        <button
                            onClick={callSeller}
                            disabled={contactLoading}
                            className="flex-1 rounded-xl py-3 text-[15px] font-semibold text-white active:opacity-90 disabled:opacity-60"
                            style={{ background: 'var(--am-accent)' }}
                        >
                            {contact
                                ? 'Позвонить'
                                : contactLoading
                                  ? 'Загрузка…'
                                  : 'Показать контакты'}
                        </button>
                        {(contact ? contact.whatsapp : true) && (
                            <button
                                onClick={openWhatsApp}
                                disabled={contactLoading}
                                aria-label="WhatsApp"
                                className="flex w-[52px] items-center justify-center rounded-xl border text-[#25d366] active:bg-muted disabled:opacity-60"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.4A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.2-.7l.6-.8c.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.2 2.2-.4 3.7a12 12 0 0 0 4.6 4.6c1.8.9 2.7.8 3.6.6.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3Z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function IconBtn({
    onClick,
    label,
    active = false,
    children,
}: {
    onClick: () => void
    label: string
    active?: boolean
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className="flex h-10 w-10 items-center justify-center rounded-full border active:bg-muted"
            style={
                active
                    ? {
                          color: 'var(--am-accent)',
                          borderColor: 'var(--am-accent-border)',
                          background: 'var(--am-accent-soft)',
                      }
                    : undefined
            }
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill={active ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                aria-hidden
            >
                {children}
            </svg>
        </button>
    )
}
