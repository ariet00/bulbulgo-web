'use client'

import { useState } from 'react'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { bridgeAvailable, openRoute } from '../bridge'

// Ссылки в разделы приложения: админ пишет [Текст](app:/real_estate) —
// схема app: несёт go_router-маршрут, тап зовёт мостовой openRoute (нативный
// экран поверх вебвью). Дефолтный urlTransform react-markdown режет
// нестандартные схемы — пропускаем app: явно.
const urlTransform = (url: string) =>
    url.startsWith('app:') ? url : defaultUrlTransform(url)

// Ссылка на YouTube-видео (watch/shorts/youtu.be/embed) в тексте становится
// плеером: превью-кадр с кнопкой, iframe грузится только по тапу.
function youtubeId(url: string): string | null {
    const m = url.match(
        /(?:youtube\.com\/(?:watch\?[^#]*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/,
    )
    return m ? m[1] : null
}

function YouTubeEmbed({ id }: { id: string }) {
    const [playing, setPlaying] = useState(false)
    if (playing) {
        return (
            <span className="my-6 block aspect-video overflow-hidden rounded-2xl bg-black">
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                />
            </span>
        )
    }
    return (
        <button
            onClick={() => setPlaying(true)}
            aria-label="Смотреть видео"
            className="relative my-6 block aspect-video w-full overflow-hidden rounded-2xl bg-black"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover opacity-80"
            />
            <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="white"
                        aria-hidden
                    >
                        <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                    </svg>
                </span>
            </span>
        </button>
    )
}

function AppLink({ route, children }: { route: string; children?: React.ReactNode }) {
    return (
        <a
            href={`app:${route}`}
            className="my-2 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[15px] font-medium text-background no-underline active:opacity-75"
            onClick={(e) => {
                e.preventDefault()
                if (bridgeAvailable()) void openRoute(route)
            }}
        >
            {children}
            <span aria-hidden>→</span>
        </a>
    )
}

// Рендер markdown-контента новости. Контент пишут только админы, поэтому
// inline-HTML разрешён (rehype-raw) — так в статью попадают <video> и
// произвольные вставки. Стили — собственные renderers, без typography-плагина.
export function NewsMarkdown({ content }: { content: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            urlTransform={urlTransform}
            components={{
                h1: ({ children }) => (
                    <h2 className="news-display mt-8 mb-3 text-[19px] font-bold leading-snug">
                        {children}
                    </h2>
                ),
                h2: ({ children }) => (
                    <h2 className="news-display mt-8 mb-3 text-[19px] font-bold leading-snug">
                        {children}
                    </h2>
                ),
                h3: ({ children }) => (
                    <h3 className="news-display mt-6 mb-2 text-[17px] font-semibold leading-snug">
                        {children}
                    </h3>
                ),
                p: ({ children }) => (
                    <p className="my-4 text-[17px] leading-[1.75]">{children}</p>
                ),
                a: ({ href, children }) => {
                    if (href?.startsWith('app:')) {
                        return (
                            <AppLink route={href.slice(4)}>{children}</AppLink>
                        )
                    }
                    const yt = href ? youtubeId(href) : null
                    if (yt) return <YouTubeEmbed id={yt} />
                    return (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium underline decoration-muted-foreground/50 underline-offset-4"
                        >
                            {children}
                        </a>
                    )
                },
                ul: ({ children }) => (
                    <ul className="my-4 space-y-2 pl-5 text-[17px] leading-[1.7] [&>li]:list-disc [&>li]:marker:text-muted-foreground">
                        {children}
                    </ul>
                ),
                ol: ({ children }) => (
                    <ol className="my-4 space-y-2 pl-5 text-[17px] leading-[1.7] [&>li]:list-decimal [&>li]:marker:text-muted-foreground">
                        {children}
                    </ol>
                ),
                blockquote: ({ children }) => (
                    <blockquote className="my-6 border-l-2 border-foreground/70 pl-4 text-[17px] italic text-muted-foreground [&>p]:my-2">
                        {children}
                    </blockquote>
                ),
                img: ({ src, alt }) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={typeof src === 'string' ? src : undefined}
                        alt={alt ?? ''}
                        loading="lazy"
                        className="my-6 w-full rounded-2xl"
                    />
                ),
                video: ({ node: _node, ...props }) => (
                    <video
                        {...props}
                        controls
                        playsInline
                        className="my-6 w-full rounded-2xl bg-black"
                    />
                ),
                hr: () => (
                    <div
                        aria-hidden
                        className="my-8 text-center text-sm tracking-[0.6em] text-muted-foreground"
                    >
                        ∗ ∗ ∗
                    </div>
                ),
                code: ({ children }) => (
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[14px]">
                        {children}
                    </code>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    )
}
