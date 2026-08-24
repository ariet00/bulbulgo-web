import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { fetchListingMeta, priceLabel } from './_listing'

// Динамическая OG-картинка объявления: фото авто на всю площадь + плашка с
// ценой/заголовком; без фото — брендовый градиент. Шрифты общие (_og/).
export const alt = 'Объявление на Авторынке BulBul Go'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const FONT_DIR = join(process.cwd(), 'src/app/_og')
const regularFont = readFile(join(FONT_DIR, '_Montserrat-Regular.ttf'))
const boldFont = readFile(join(FONT_DIR, '_Montserrat-Bold.ttf'))
const logoFile = readFile(join(process.cwd(), 'public/favicon.png'))

const ACCENT = '#e8603c'

export default async function Image({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [regular, bold, logo, l] = await Promise.all([
        regularFont,
        boldFont,
        logoFile,
        fetchListingMeta(id),
    ])
    const logoSrc = `data:image/png;base64,${logo.toString('base64')}`
    const price = l ? priceLabel(l.price, l.currencyCode) : null

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    fontFamily: 'Montserrat',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #0b0b0f 0%, #1c1c22 100%)',
                    position: 'relative',
                }}
            >
                {l?.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={l.cover}
                        width={1200}
                        height={630}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            objectFit: 'cover',
                        }}
                    />
                )}
                {/* затемнение снизу под текст */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(180deg, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.82) 100%)',
                    }}
                />

                {/* бренд-строка */}
                <div
                    style={{
                        position: 'absolute',
                        top: 44,
                        left: 56,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                    }}
                >
                    <img src={logoSrc} width={56} height={56} style={{ borderRadius: 16 }} />
                    <div style={{ fontSize: 30, fontWeight: 700 }}>
                        BulBul Go · Авторынок
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        padding: '0 56px 52px',
                    }}
                >
                    {price && (
                        <div
                            style={{
                                fontSize: 64,
                                fontWeight: 700,
                                color: ACCENT,
                            }}
                        >
                            {price}
                        </div>
                    )}
                    <div style={{ fontSize: 44, fontWeight: 700 }}>
                        {l?.title ?? 'Объявление в BulBul Go'}
                    </div>
                    {l?.specLine && (
                        <div style={{ display: 'flex', fontSize: 28, opacity: 0.85 }}>
                            {`${l.specLine}${l.regionName ? ` · ${l.regionName}` : ''}`}
                        </div>
                    )}
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                { name: 'Montserrat', data: regular, weight: 400 },
                { name: 'Montserrat', data: bold, weight: 700 },
            ],
        },
    )
}
