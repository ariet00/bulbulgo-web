import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import OpenAppClient from './_OpenAppClient'
import { fetchListingMeta } from './_listing'

// OG-теги отдаём server-side: краулеры чатов (WhatsApp/Telegram) не выполняют
// JS. Картинку рисует соседний opengraph-image.tsx (фото объекта + цена).

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params
    const l = await fetchListingMeta(id)
    const url = `${SITE_URL}/real_estate/details/${id}`

    if (!l) {
        return {
            title: 'BulBul Go — Недвижимость',
            robots: { index: false, follow: false },
            openGraph: {
                title: 'BulBul Go — Недвижимость',
                description: 'Объявление в приложении BulBul Go.',
                url,
                siteName: 'BulBul Go',
                type: 'website',
            },
        }
    }

    const description =
        [l.priceText, l.specLine, l.regionName].filter(Boolean).join(' · ') ||
        'Объявление в разделе Недвижимость BulBul Go'

    return {
        title: `${l.title} — BulBul Go`,
        robots: { index: false, follow: false },
        openGraph: {
            title: l.title,
            description,
            url,
            siteName: 'BulBul Go',
            type: 'website',
            // images берётся из opengraph-image.tsx автоматически.
        },
        twitter: { card: 'summary_large_image', title: l.title, description },
    }
}

export default async function RealEstateSharePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const l = await fetchListingMeta(id)

    return (
        <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center gap-5 px-5 py-10">
            {l ? (
                <div className="overflow-hidden rounded-2xl border">
                    {l.cover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={l.cover}
                            alt=""
                            className="aspect-[4/3] w-full object-cover"
                        />
                    )}
                    <div className="px-4 py-3.5">
                        {l.priceText && (
                            <p className="font-mono text-[22px] font-bold tracking-tight">
                                {l.priceText}
                            </p>
                        )}
                        <h1 className="mt-0.5 text-[17px] font-semibold leading-snug">
                            {l.title}
                        </h1>
                        {l.specLine && (
                            <p className="mt-1 text-[13px] text-muted-foreground">
                                {l.specLine}
                            </p>
                        )}
                        {l.regionName && (
                            <p className="mt-1 text-[12px] text-muted-foreground/80">
                                {l.regionName}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <h1 className="text-[18px] font-semibold">
                        Объявление недоступно
                    </h1>
                    <p className="mt-1.5 text-[14px] text-muted-foreground">
                        Возможно, его уже сняли с публикации — но в разделе
                        Недвижимость BulBul Go есть другие.
                    </p>
                </div>
            )}

            <OpenAppClient id={id} />
        </main>
    )
}
