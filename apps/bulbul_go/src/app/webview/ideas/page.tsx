'use client'

import { useEffect, useRef, useState } from 'react'
import * as bridge from '../bridge'
import { ensureAuth, trySilentAuth } from '../auth'
import { Chip } from '../components/Chip'
import {
    IDEA_CATEGORIES,
    IDEA_STATUS_LABELS,
    createIdea,
    fetchMyIdeas,
    uploadIdeaPhoto,
    type IdeaCategoryId,
    type IdeaStatus,
    type MyIdea,
} from './lib'
import './ideas.css'

// «Идеи и предложения» — webview-сервис `ideas` (пункт в профиле): форма
// отправки идеи + свои идеи со статусами. Страница открывается без логина,
// авторизация — лениво при отправке (ensureAuth); заголовок рисует нативный
// AppBar приложения.

const MAX_PHOTOS = 3
const MIN_TEXT = 10

type Draft = { file: File; preview: string }

const STATUS_BADGE: Record<IdeaStatus, string> = {
    new: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    planned: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    done: 'bg-green-500/10 text-green-600 dark:text-green-400',
    declined: 'bg-muted text-muted-foreground',
}

function base64ToFile(b64: string, mime: string, name: string): File {
    const bytes = atob(b64)
    const arr = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
    return new File([arr], name || 'photo.jpg', { type: mime || 'image/jpeg' })
}

export default function IdeasPage() {
    const [category, setCategory] = useState<IdeaCategoryId>('suggestion')
    const [text, setText] = useState('')
    const [photos, setPhotos] = useState<Draft[]>([])
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sent, setSent] = useState(false)

    const [mine, setMine] = useState<MyIdea[] | null>(null)
    const fileInput = useRef<HTMLInputElement>(null)

    // Тихая авторизация: если пользователь залогинен в приложении — сразу
    // показываем его идеи; аноним видит только форму.
    useEffect(() => {
        void trySilentAuth().then((authed) => {
            if (authed) fetchMyIdeas().then(setMine).catch(() => {})
        })
    }, [])

    const addPhotos = async () => {
        const left = MAX_PHOTOS - photos.length
        if (left <= 0) return
        if (bridge.bridgeAvailable()) {
            const items = await bridge.pickPhotos(left).catch(() => null)
            if (!items) return
            setPhotos((prev) => [
                ...prev,
                ...items.slice(0, left).map((p) => {
                    const file = base64ToFile(p.base64, p.mimeType, p.name)
                    return { file, preview: URL.createObjectURL(file) }
                }),
            ])
        } else {
            fileInput.current?.click()
        }
    }

    const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).slice(
            0,
            MAX_PHOTOS - photos.length,
        )
        setPhotos((prev) => [
            ...prev,
            ...files.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            })),
        ])
        e.target.value = ''
    }

    const removePhoto = (preview: string) => {
        setPhotos((prev) => prev.filter((p) => p.preview !== preview))
        URL.revokeObjectURL(preview)
    }

    const submit = async () => {
        if (sending) return
        setError(null)
        if (text.trim().length < MIN_TEXT) {
            setError('Опишите идею чуть подробнее — хотя бы пару предложений.')
            return
        }
        setSending(true)
        try {
            // Логин лениво: залогинен — молча, нет — нативный экран входа.
            if (!(await ensureAuth())) {
                setError(
                    bridge.bridgeAvailable()
                        ? 'Для отправки нужно войти в аккаунт.'
                        : 'Откройте сервис в приложении BulBul Go, чтобы отправить идею.',
                )
                return
            }
            const urls: string[] = []
            for (const p of photos) urls.push(await uploadIdeaPhoto(p.file))
            await createIdea({ text: text.trim(), category, photos: urls })

            photos.forEach((p) => URL.revokeObjectURL(p.preview))
            setText('')
            setPhotos([])
            setSent(true)
            if (bridge.bridgeAvailable()) void bridge.haptic('success')
            fetchMyIdeas().then(setMine).catch(() => {})
        } catch (e) {
            setError(
                e instanceof Error && e.message && !e.message.startsWith('HTTP')
                    ? e.message
                    : 'Не удалось отправить — попробуйте ещё раз.',
            )
        } finally {
            setSending(false)
        }
    }

    return (
        <main className="mx-auto max-w-lg px-5 pb-12 pt-5">
            {sent ? (
                <div className="wv-rise flex flex-col items-center rounded-3xl border bg-[var(--wv-accent-soft)]/40 px-6 py-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--wv-accent)] text-white">
                        <CheckIcon />
                    </div>
                    <p className="mt-4 text-[17px] font-semibold">
                        Спасибо за идею!
                    </p>
                    <p className="mt-1.5 max-w-[19rem] text-[14px] leading-relaxed text-muted-foreground">
                        Мы читаем каждое предложение. Статус можно следить в
                        списке ниже.
                    </p>
                    <button
                        onClick={() => setSent(false)}
                        className="mt-5 rounded-full border px-5 py-2 text-sm font-medium active:bg-muted"
                    >
                        Отправить ещё одну
                    </button>
                </div>
            ) : (
                <div className="wv-rise">
                    <p className="text-[15px] leading-relaxed text-muted-foreground">
                        Расскажите, чего не хватает в BulBul Go или что работает
                        не так — мы читаем каждое предложение.
                    </p>

                    <div className="mt-5 flex gap-2">
                        {IDEA_CATEGORIES.map((c) => (
                            <Chip
                                key={c.id}
                                active={category === c.id}
                                onClick={() => setCategory(c.id)}
                            >
                                {c.label}
                            </Chip>
                        ))}
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={6}
                        maxLength={4000}
                        placeholder={
                            category === 'problem'
                                ? 'Что пошло не так? Опишите проблему и где она возникает…'
                                : 'Опишите вашу идею — что и почему стоит улучшить…'
                        }
                        className="mt-4 w-full resize-none rounded-2xl border bg-muted/40 px-4 py-3.5 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-[var(--wv-accent-border)]"
                    />

                    <div className="mt-3 flex flex-wrap gap-2.5">
                        {photos.map((p) => (
                            <div key={p.preview} className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={p.preview}
                                    alt=""
                                    className="h-20 w-20 rounded-xl object-cover"
                                />
                                <button
                                    onClick={() => removePhoto(p.preview)}
                                    aria-label="Убрать фото"
                                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background"
                                >
                                    <CrossIcon />
                                </button>
                            </div>
                        ))}
                        {photos.length < MAX_PHOTOS && (
                            <button
                                onClick={() => void addPhotos()}
                                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-muted-foreground active:bg-muted"
                            >
                                <CameraIcon />
                                <span className="text-[11px]">Скриншот</span>
                            </button>
                        )}
                    </div>
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={onFiles}
                    />

                    {error && (
                        <p className="mt-3 text-[13.5px] leading-snug text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={() => void submit()}
                        disabled={sending}
                        className="mt-5 h-12 w-full rounded-2xl bg-[var(--wv-accent)] text-[15.5px] font-semibold text-white transition-opacity active:opacity-85 disabled:opacity-60"
                    >
                        {sending ? 'Отправляем…' : 'Отправить идею'}
                    </button>
                </div>
            )}

            {mine && mine.length > 0 && (
                <section className="mt-10">
                    <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Мои идеи
                    </h2>
                    <div className="mt-2 divide-y divide-border/70">
                        {mine.map((i, n) => (
                            <div
                                key={i.id}
                                className="wv-rise py-4"
                                style={
                                    {
                                        '--wv-delay': `${Math.min(n, 8) * 40}ms`,
                                    } as React.CSSProperties
                                }
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium ${STATUS_BADGE[i.status]}`}
                                    >
                                        {IDEA_STATUS_LABELS[i.status]}
                                    </span>
                                    <span className="text-[12px] text-muted-foreground">
                                        {formatDate(i.created_at)}
                                    </span>
                                </div>
                                <p className="mt-2.5 whitespace-pre-wrap text-[14.5px] leading-relaxed">
                                    {i.text}
                                </p>
                                {i.photos.length > 0 && (
                                    <div className="mt-2.5 flex gap-2">
                                        {i.photos.map((url) => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                key={url}
                                                src={url}
                                                alt=""
                                                loading="lazy"
                                                className="h-16 w-16 rounded-lg object-cover"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    )
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
    })
}

function CheckIcon() {
    return (
        <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="m4.5 12.5 5 5 10-11" />
        </svg>
    )
}

function CrossIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            aria-hidden
        >
            <path d="M6 6l12 12M18 6 6 18" />
        </svg>
    )
}

function CameraIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M4 8h2.5l1.5-2.5h8L17.5 8H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
            <circle cx="12" cy="13.5" r="3.5" />
        </svg>
    )
}
