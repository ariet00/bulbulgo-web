import { MapPin } from 'lucide-react'

/** Ссылки на точку в Google Maps и 2ГИС — проверить координаты глазами. */
export function MapLinks({ lat, lng }: { lat: number; lng: number }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <a
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank"
                rel="noreferrer"
                title={`Google Maps: ${lat}, ${lng}`}
                className="inline-flex items-center text-emerald-600 hover:text-emerald-700"
            >
                <MapPin className="h-3.5 w-3.5" />
            </a>
            <a
                href={`https://2gis.kg/search/${lat}%2C${lng}`}
                target="_blank"
                rel="noreferrer"
                title={`2ГИС: ${lat}, ${lng}`}
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
            >
                2ГИС
            </a>
        </span>
    )
}
