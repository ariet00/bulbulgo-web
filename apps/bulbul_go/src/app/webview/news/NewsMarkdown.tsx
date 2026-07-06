'use client'

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
