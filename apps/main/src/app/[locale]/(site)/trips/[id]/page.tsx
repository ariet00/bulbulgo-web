'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useTrip, useTripPhone, cn } from '@doska/shared';
import {
    Button,
    Card,
    CardContent,
    Badge,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Separator,
    Skeleton
} from '@doska/ui';
import {
    ArrowLeft,
    Phone,
    MessageCircle,
    MapPin,
    Navigation,
    Calendar,
    Users,
    Package,
    Car,
    Star,
    ShieldCheck,
    AlertCircle,
    Cigarette,
    Luggage,
    Home,
    AirVent,
    Box
} from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { Link, useRouter } from '@doska/i18n';
import BackButton from '@/components/BackButton';

export default function TripDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const format = useFormatter();
    const tripId = Number(id);

    const { data: trip, isLoading, isError } = useTrip(tripId);

    const [showContact, setShowContact] = React.useState(false);
    const { data: phone, isLoading: isLoadingPhone } = useTripPhone(tripId, trip?.role, showContact);

    if (isLoading) return <TripDetailsLoading />;

    if (isError || !trip) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="bg-destructive/10 text-destructive p-6 rounded-full w-fit mx-auto mb-6">
                    <AlertCircle className="h-12 w-12" />
                </div>
                <h1 className="text-2xl font-black mb-2">Объявление не найдено</h1>
                <p className="text-muted-foreground mb-8">Возможно, оно было удалено или перемещено</p>
                <Button onClick={() => router.back()} className="rounded-2xl px-10">
                    Вернуться назад
                </Button>
            </div>
        );
    }

    const isDriver = trip.role === 'driver';
    const isParcel = trip.role === 'parcel';

    return (
        <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
            <div className="flex flex-col gap-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <BackButton />
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Route Card */}
                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-primary/5 overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex flex-col gap-10">
                                    <div className="flex items-start gap-6">
                                        <div className="flex flex-col items-center gap-1.5 pt-1.5">
                                            <div className="h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                                            <div className="w-0.5 h-16 bg-dashed border-l-2 border-dashed border-muted-foreground/30" />
                                            <MapPin className="h-6 w-6 text-red-500" />
                                        </div>
                                        <div className="flex flex-col gap-12 flex-1">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Откуда</span>
                                                <h2 className="text-2xl md:text-3xl font-black">{trip.from_location?.name}</h2>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Куда</span>
                                                <h2 className="text-2xl md:text-3xl font-black">{trip.to_location?.name}</h2>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Waypoints if any */}
                                    {trip.waypoints && trip.waypoints.length > 0 && (
                                        <div className="flex flex-col gap-3 p-4 bg-secondary/30 rounded-3xl">
                                            <h4 className="text-xs font-black text-muted-foreground uppercase px-2">Проездом через</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {trip.waypoints.map((wp) => (
                                                    <Badge key={wp.id} variant="secondary" className="rounded-xl px-3 py-1 bg-background">
                                                        {wp.region?.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="rounded-[2rem] border-none shadow-lg shadow-primary/5">
                                <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                                    <Calendar className="h-6 w-6 text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Выезд</span>
                                        <span className="text-lg font-black">
                                            {format.dateTime(new Date(trip.departure_date), {
                                                day: 'numeric',
                                                month: 'long',
                                            })}
                                        </span>
                                        {trip.time && <span className="text-sm font-bold text-primary">{trip.time}</span>}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-[2rem] border-none shadow-lg shadow-primary/5">
                                <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                                    <Badge className="bg-primary/10 text-primary border-none text-xl p-0 h-auto hover:bg-primary/10">
                                        {trip.price ? `${trip.price.toLocaleString()}` : "—"}
                                    </Badge>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">
                                            {isParcel ? "Цена за посылку" : "Цена за место"}
                                        </span>
                                        <span className="text-lg font-black">сом</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Comment Section */}
                        {trip.comment && (
                            <Card className="rounded-[2.5rem] border-none shadow-lg shadow-primary/5">
                                <CardContent className="p-8">
                                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5 text-primary" />
                                        Комментарий
                                    </h3>
                                    <p className="text-muted-foreground font-medium leading-relaxed">
                                        {trip.comment}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Preferences */}
                        {trip.data && hasPreferences(trip.data) && (
                            <Card className="rounded-[2.5rem] border-none shadow-lg shadow-primary/5">
                                <CardContent className="p-8">
                                    <h3 className="text-lg font-black mb-6">Дополнительно</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <PreferenceItem icon={<Cigarette className="h-5 w-5" />} label="Можно курить" active={trip.data.pref_smoking_allowed} />
                                        <PreferenceItem icon={<Luggage className="h-5 w-5" />} label="С багажом" active={trip.data.pref_baggage_allowed} />
                                        <PreferenceItem icon={<Home className="h-5 w-5" />} label="До двери" active={trip.data.pref_door_to_door} />
                                        <PreferenceItem icon={<AirVent className="h-5 w-5" />} label="Кондиционер" active={trip.data.pref_air_conditioning} />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar: User and Vehicle */}
                    <div className="flex flex-col gap-6">
                        {/* User Card */}
                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-primary/5">
                            <CardContent className="p-8 flex flex-col items-center text-center">
                                {trip.user?.username !== 'chat_parser_user' ? (
                                    <>
                                        <Avatar className="h-24 w-24 mb-4 border-4 border-background ring-4 ring-primary/5">
                                            <AvatarImage src={trip.user?.data?.avatar} />
                                            <AvatarFallback className="text-2xl font-black bg-primary/5 text-primary">
                                                {trip.user?.username?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <h3 className="text-xl font-black">{trip.user?.username}</h3>
                                        <div className="flex items-center gap-1 text-sm font-bold text-amber-500 bg-amber-500/5 px-3 py-1 rounded-full mt-2">
                                            <Star className="h-4 w-4 fill-amber-500" />
                                            <span>{trip.user?.data?.rating || "5.0"}</span>
                                            <span className="text-muted-foreground ml-1">({trip.user?.data?.review_count || 0})</span>
                                        </div>
                                        <Separator className="my-6 opacity-50" />
                                    </>
                                ) : null}

                                <div className="w-full flex flex-col gap-3">
                                    {!showContact ? (
                                        <Button
                                            onClick={() => setShowContact(true)}
                                            className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg shadow-primary/20"
                                        >
                                            <Phone className="h-5 w-5" />
                                            Показать телефон
                                        </Button>
                                    ) : (
                                        <Button
                                            asChild
                                            className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg shadow-primary/20 bg-green-500 hover:bg-green-600"
                                        >
                                            <a href={`tel:${phone}`}>
                                                <Phone className="h-5 w-5" />
                                                {isLoadingPhone ? "Загрузка..." : phone}
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="outline" className="h-14 rounded-2xl font-black text-lg gap-2 border-primary/20 hover:bg-primary/5">
                                        <MessageCircle className="h-5 w-5" />
                                        Написать
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Card */}
                        {isDriver && trip.vehicle && (
                            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-primary/5 overflow-hidden">
                                <div className="bg-primary/5 p-4 flex items-center gap-3">
                                    <Car className="h-6 w-6 text-primary" />
                                    <h3 className="font-black">Автомобиль</h3>
                                </div>
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xl font-black">{trip.vehicle.brand} {trip.vehicle.model}</span>
                                        <span className="text-sm font-bold text-muted-foreground">{trip.vehicle.color}, {trip.vehicle.year} г.</span>
                                    </div>
                                    <Badge variant="outline" className="mt-4 rounded-lg font-mono font-bold border-muted-foreground/30 px-3 py-1">
                                        {trip.vehicle.plate_number?.toUpperCase()}
                                    </Badge>

                                    {/* Vehicle Images if any */}
                                    {trip.vehicle.data?.images && trip.vehicle.data.images.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 mt-6">
                                            {trip.vehicle.data.images.slice(0, 2).map((img, i) => (
                                                <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-muted">
                                                    <img src={img.url} className="w-full h-full object-cover" alt="Car" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PreferenceItem({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={cn(
            "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all",
            active ? "border-primary/20 bg-primary/5 text-primary" : "border-transparent bg-secondary/30 opacity-40"
        )}>
            {icon}
            <span className="text-sm font-bold">{label}</span>
            {active && <ShieldCheck className="h-4 w-4 ml-auto" />}
        </div>
    );
}

function hasPreferences(data: any) {
    return data.pref_smoking_allowed || data.pref_baggage_allowed || data.pref_door_to_door || data.pref_air_conditioning;
}

function TripDetailsLoading() {
    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl animate-pulse">
            <Skeleton className="h-10 w-32 rounded-xl mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Skeleton className="h-60 rounded-[2.5rem]" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-32 rounded-[2rem]" />
                        <Skeleton className="h-32 rounded-[2rem]" />
                    </div>
                    <Skeleton className="h-40 rounded-[2.5rem]" />
                </div>
                <div className="flex flex-col gap-6">
                    <Skeleton className="h-80 rounded-[2.5rem]" />
                    <Skeleton className="h-60 rounded-[2.5rem]" />
                </div>
            </div>
        </div>
    );
}
