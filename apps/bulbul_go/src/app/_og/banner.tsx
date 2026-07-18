import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

// Общий бренд-баннер 1200x630 для превью ссылок (Telegram/WhatsApp/соцсети).
// Рендерится тонкими opengraph-image.tsx в (marketing)/, (marketing)/download/
// и [locale]/ — у /download свой файл, т.к. его layout переопределяет openGraph
// и картинка родительского сегмента теряется (Next не мержит openGraph глубоко).
// Шрифты и стиль — как у OG-картинки поездки (rideshare/trips/[id]).

export const ogAlt = 'BulBul Go — поиск попутчиков по всему Кыргызстану'
export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

// Montserrat поддерживает кириллицу. Читаем с диска через fs; файлы попадают
// в serverless-бандлы og-роутов через outputFileTracingIncludes (next.config.ts).
const FONT_DIR = join(process.cwd(), 'src/app/_og')
const regularFont = readFile(join(FONT_DIR, '_Montserrat-Regular.ttf'))
const boldFont = readFile(join(FONT_DIR, '_Montserrat-Bold.ttf'))

const ACCENT_BG = 'rgba(52,211,153,0.15)'
const BG_FROM = '#0b0b0f'
const BG_TO = '#1c1c22'

export async function renderBrandOgImage() {
    const [regular, bold] = await Promise.all([regularFont, boldFont])

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 32,
                    background: `linear-gradient(135deg, ${BG_FROM} 0%, ${BG_TO} 100%)`,
                    color: '#ffffff',
                    fontFamily: 'Montserrat',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 128,
                        height: 128,
                        borderRadius: 36,
                        background: ACCENT_BG,
                        fontSize: 68,
                    }}
                >
                    🚗
                </div>
                <div
                    style={{
                        display: 'flex',
                        fontSize: 96,
                        fontWeight: 700,
                        lineHeight: 1,
                    }}
                >
                    BulBul Go
                </div>
                <div style={{ display: 'flex', fontSize: 36, color: '#a1a1aa' }}>
                    Поиск попутчиков по всему Кыргызстану
                </div>
            </div>
        ),
        {
            ...ogSize,
            fonts: [
                { name: 'Montserrat', data: regular, weight: 400, style: 'normal' },
                { name: 'Montserrat', data: bold, weight: 700, style: 'normal' },
            ],
        },
    )
}
