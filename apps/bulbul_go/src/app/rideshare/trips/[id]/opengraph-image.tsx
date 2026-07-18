import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { fetchTripMeta, roleLabel, seatsLabel } from './_trip'

// Динамическая OG-картинка под конкретную поездку (маршрут/дата/цена/места).
// Next автоматически подставляет её в og:image / twitter:image страницы.
export const alt = 'Поездка в BulBul Go'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Montserrat поддерживает кириллицу (Geist из основного лейаута — нет). Читаем
// шрифт с диска через fs (fetch(new URL(..., import.meta.url)) ломается в
// Turbopack — отдаёт относительный путь без origin). Файлы попадают в бандл
// функции через outputFileTracingIncludes (см. next.config.ts). Шрифты общие
// с бренд-баннером — лежат в src/app/_og/.
const FONT_DIR = join(process.cwd(), 'src/app/_og')
const regularFont = readFile(join(FONT_DIR, '_Montserrat-Regular.ttf'))
const boldFont = readFile(join(FONT_DIR, '_Montserrat-Bold.ttf'))
const logoFile = readFile(join(process.cwd(), 'public/favicon.png'))

const ACCENT = '#34d399' // цена/акцент
const BG_FROM = '#0b0b0f'
const BG_TO = '#1c1c22'

// Кегль маршрута подбираем под суммарную длину названий, чтобы строка
// «A → B» влезла в ширину баннера (1200 − 2×80 паддинга) без обрезки.
// 0.66 — примерная ширина символа Montserrat Bold в долях кегля, +3 — стрелка.
function routeFontSize(from: string, to: string): number {
    const len = from.length + to.length + 3
    const fit = Math.floor(1040 / (0.66 * len))
    return Math.max(34, Math.min(68, fit))
}

export default async function Image({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [regular, bold, logo, trip] = await Promise.all([
        regularFont,
        boldFont,
        logoFile,
        fetchTripMeta(id),
    ])
    const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

    const chips: string[] = []
    if (trip?.dateLabel) chips.push(trip.dateLabel)
    if (trip?.price != null) chips.push(`${trip.price.toLocaleString('ru-RU')} сом`)
    if (trip && trip.role !== 'parcel' && trip.seats != null) {
        chips.push(seatsLabel(trip.seats))
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '72px 80px',
                    background: `linear-gradient(135deg, ${BG_FROM} 0%, ${BG_TO} 100%)`,
                    color: '#ffffff',
                    fontFamily: 'Montserrat',
                }}
            >
                {/* Бренд-строка */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <img
                        src={logoSrc}
                        width={64}
                        height={64}
                        style={{ borderRadius: 20 }}
                    />
                    <div style={{ fontSize: 34, fontWeight: 700 }}>BulBul Go</div>
                </div>

                {/* Роль + маршрут */}
                {trip ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                        }}
                    >
                        {roleLabel(trip.role) && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignSelf: 'flex-start',
                                    padding: '10px 22px',
                                    borderRadius: 999,
                                    background: 'rgba(52,211,153,0.15)',
                                    border: '1px solid rgba(52,211,153,0.4)',
                                    color: ACCENT,
                                    fontSize: 30,
                                    fontWeight: 700,
                                }}
                            >
                                {roleLabel(trip.role)}
                            </div>
                        )}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                overflow: 'hidden',
                                fontSize: routeFontSize(trip.from, trip.to),
                                fontWeight: 700,
                                lineHeight: 1.05,
                            }}
                        >
                            <span
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 900,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {trip.from}
                            </span>
                            <span style={{ color: ACCENT, padding: '0 24px' }}>
                                →
                            </span>
                            <span
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 900,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {trip.to}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', fontSize: 68, fontWeight: 700 }}>
                        Попутки Кыргызстана
                    </div>
                )}

                {/* Чипсы: дата · цена · места */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    {chips.length > 0 ? (
                        chips.map((c) => (
                            <div
                                key={c}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px 28px',
                                    borderRadius: 999,
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    fontSize: 34,
                                    fontWeight: 700,
                                }}
                            >
                                {c}
                            </div>
                        ))
                    ) : (
                        <div style={{ display: 'flex', fontSize: 32, color: '#a1a1aa' }}>
                            Открой в приложении BulBul Go
                        </div>
                    )}
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                { name: 'Montserrat', data: regular, weight: 400, style: 'normal' },
                { name: 'Montserrat', data: bold, weight: 700, style: 'normal' },
            ],
        },
    )
}
