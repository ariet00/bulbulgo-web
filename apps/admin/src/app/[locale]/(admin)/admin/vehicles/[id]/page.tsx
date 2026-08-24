'use client'

import { useAdminVehicle } from '@/hooks/queries/admin'
import { useParams } from 'next/navigation'
import { Link } from '@doska/i18n'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    BackButton,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
} from '@doska/ui'
import {
    Car,
    User as UserIcon,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

type VehicleImage = { url: string; thumbnail_url?: string }

function extractImages(data: any): VehicleImage[] {
    const raw = data?.images
    if (!Array.isArray(raw)) return []
    return raw
        .map((i: any) => {
            if (typeof i === 'string') return { url: i }
            if (i && typeof i.url === 'string') return { url: i.url, thumbnail_url: i.thumbnail_url }
            return null
        })
        .filter(Boolean) as VehicleImage[]
}

export default function AdminVehicleDetailPage() {
    const params = useParams()
    const rawId = params.id
    const id = rawId ? parseInt(Array.isArray(rawId) ? rawId[0] : rawId) : 0
    const { data: vehicle, isLoading } = useAdminVehicle(id)

    const [lightbox, setLightbox] = useState<number | null>(null)

    if (isLoading) return <div className="p-6">Загрузка…</div>
    if (!vehicle) return <div className="p-6">Авто не найдено</div>

    const images = extractImages(vehicle.data)

    return (
        <div className="space-y-6 p-6">
            <BackButton />

            <h1 className="text-2xl font-bold">
                {vehicle.brand} {vehicle.model}
                {vehicle.plate_number && (
                    <span className="ml-2 font-mono text-lg text-muted-foreground">
                        {vehicle.plate_number}
                    </span>
                )}
            </h1>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Car className="mr-2 h-5 w-5" />
                            Общая информация
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Марка" value={vehicle.brand} />
                            <Field label="Модель" value={vehicle.model} />
                            <Field label="Госномер" value={vehicle.plate_number} mono />
                            <Field label="Год" value={vehicle.year} />
                            <Field label="Цвет" value={vehicle.color} />
                            <Field label="Тип" value={vehicle.vehicle_type} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <UserIcon className="mr-2 h-5 w-5" />
                            Владелец
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {vehicle.user ? (
                            <Link
                                href={`/admin/users/${vehicle.user.id}`}
                                className="group flex flex-col gap-1"
                            >
                                <span className="flex items-center gap-1 text-lg font-medium group-hover:underline">
                                    {vehicle.user.full_name ||
                                        vehicle.user.name ||
                                        vehicle.user.username}
                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    @{vehicle.user.username}
                                </span>
                                {vehicle.user.phone && (
                                    <span className="text-sm text-muted-foreground">
                                        {vehicle.user.phone}
                                    </span>
                                )}
                                {vehicle.user.email && (
                                    <span className="text-sm text-muted-foreground">
                                        {vehicle.user.email}
                                    </span>
                                )}
                            </Link>
                        ) : (
                            <p className="italic text-muted-foreground">
                                Нет данных о владельце
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Photos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <ImageIcon className="mr-2 h-5 w-5" />
                        Фотографии
                        {images.length > 0 && (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                ({images.length})
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {images.length === 0 ? (
                        <p className="italic text-muted-foreground">Фото не загружены</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setLightbox(i)}
                                    className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img.thumbnail_url || img.url}
                                        alt={`Фото ${i + 1}`}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Lightbox
                images={images}
                index={lightbox}
                onClose={() => setLightbox(null)}
                onIndexChange={setLightbox}
            />
        </div>
    )
}

function Field({
    label,
    value,
    mono,
}: {
    label: string
    value?: string | number | null
    mono?: boolean
}) {
    return (
        <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
            <p className={`font-medium ${mono ? 'font-mono' : ''}`}>
                {value === null || value === undefined || value === '' ? '—' : value}
            </p>
        </div>
    )
}

function Lightbox({
    images,
    index,
    onClose,
    onIndexChange,
}: {
    images: VehicleImage[]
    index: number | null
    onClose: () => void
    onIndexChange: (i: number) => void
}) {
    const open = index !== null
    const go = useCallback(
        (delta: number) => {
            if (index === null || images.length === 0) return
            onIndexChange((index + delta + images.length) % images.length)
        },
        [index, images.length, onIndexChange],
    )

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') go(-1)
            if (e.key === 'ArrowRight') go(1)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, go])

    if (!open || index === null) return null
    const img = images[index]

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-4xl p-2">
                <DialogTitle className="sr-only">
                    Фото {index + 1} из {images.length}
                </DialogTitle>
                <div className="relative flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={img.url}
                        alt={`Фото ${index + 1}`}
                        className="max-h-[80vh] w-auto rounded object-contain"
                    />
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80"
                                onClick={() => go(-1)}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80"
                                onClick={() => go(1)}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                                {index + 1} / {images.length}
                            </span>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
