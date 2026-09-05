'use client'

import { useRef, useState } from 'react'
import * as bridge from '../../../bridge'
import { uploadPhoto } from '../../lib/api'
import type { Photo } from '../../lib/types'

// Шаг фото: выбор через мост (нативный пикер, до 12) или <input multiple>
// вне приложения; загрузка на бэк сразу, первое фото = обложка, любое можно
// сделать обложкой или удалить.

const MAX_PHOTOS = 12

function base64ToFile(b64: string, mime: string, name: string): File {
    const bytes = atob(b64)
    const arr = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
    return new File([arr], name || 'photo.jpg', { type: mime || 'image/jpeg' })
}

export function PhotosStep({
    photos,
    onChange,
}: {
    photos: Photo[]
    onChange: (photos: Photo[]) => void
}) {
    const [uploading, setUploading] = useState(0)
    const [failed, setFailed] = useState(false)
    const fileInput = useRef<HTMLInputElement>(null)

    const addFiles = async (files: File[]) => {
        const room = MAX_PHOTOS - photos.length
        const batch = files.slice(0, room)
        if (!batch.length) return
        setFailed(false)
        setUploading(batch.length)
        const uploaded: Photo[] = []
        for (const f of batch) {
            try {
                uploaded.push(await uploadPhoto(f))
            } catch {
                setFailed(true)
            } finally {
                setUploading((n) => n - 1)
            }
        }
        if (uploaded.length) {
            onChange(
                [...photos, ...uploaded].map((p, i) => ({ ...p, sort: i })),
            )
        }
    }

    const pick = async () => {
        if (bridge.bridgeAvailable()) {
            try {
                const items = await bridge.pickPhotos(MAX_PHOTOS - photos.length)
                if (items?.length) {
                    await addFiles(
                        items.map((p) =>
                            base64ToFile(p.base64, p.mimeType, p.name),
                        ),
                    )
                }
                return
            } catch {
                /* мост отказал — падаем на файловый инпут */
            }
        }
        fileInput.current?.click()
    }

    const removeAt = (idx: number) =>
        onChange(
            photos.filter((_, i) => i !== idx).map((p, i) => ({ ...p, sort: i })),
        )

    const makeCover = (idx: number) => {
        const next = [photos[idx], ...photos.filter((_, i) => i !== idx)]
        onChange(next.map((p, i) => ({ ...p, sort: i })))
    }

    return (
        <div>
            <div className="grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                    <div
                        key={p.url}
                        className="relative aspect-square overflow-hidden rounded-xl border bg-muted"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={p.thumb ?? p.url}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                        {i === 0 ? (
                            <span
                                className="absolute left-1 top-1 rounded px-1.5 py-px text-[10px] font-semibold text-white"
                                style={{ background: 'var(--wv-primary)' }}
                            >
                                Обложка
                            </span>
                        ) : (
                            <button
                                onClick={() => makeCover(i)}
                                className="absolute left-1 top-1 rounded bg-black/55 px-1.5 py-px text-[10px] font-medium text-white"
                            >
                                На обложку
                            </button>
                        )}
                        <button
                            onClick={() => removeAt(i)}
                            aria-label="Удалить фото"
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white"
                        >
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                                <path d="M3 3l10 10M13 3L3 13" />
                            </svg>
                        </button>
                    </div>
                ))}

                {Array.from({ length: uploading }).map((_, i) => (
                    <div
                        key={`u${i}`}
                        className="wv-skeleton aspect-square rounded-xl"
                    />
                ))}

                {photos.length + uploading < MAX_PHOTOS && (
                    <button
                        onClick={pick}
                        className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-muted-foreground active:bg-muted"
                    >
                        <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                            <path d="M8 3v10M3 8h10" />
                        </svg>
                        <span className="text-[11px] font-medium">Добавить</span>
                    </button>
                )}
            </div>

            <p className="mt-3 text-[12px] text-muted-foreground">
                До {MAX_PHOTOS} фото. Первое фото — обложка объявления; хорошие
                снимки с 3–4 ракурсов продают быстрее.
            </p>
            {failed && (
                <p className="mt-1 text-[12px] text-red-500">
                    Часть фото не загрузилась — попробуйте ещё раз.
                </p>
            )}

            <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                    const files = Array.from(e.target.files ?? [])
                    e.target.value = ''
                    void addFiles(files)
                }}
            />
        </div>
    )
}
