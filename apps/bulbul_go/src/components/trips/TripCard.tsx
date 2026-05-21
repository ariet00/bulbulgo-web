'use client';

import * as React from 'react';
import { Trip } from '@doska/shared';
import {
    Card,
    CardContent,
    Badge,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Button
} from '@doska/ui';
import {
    ArrowRight,
    Users,
    Package,
    Clock,
    Star,
    MapPin,
    Calendar
} from 'lucide-react';
import { useFormatter, useTranslations, useNow } from 'next-intl';
import { Link } from '@doska/i18n';
import { cn } from '@doska/shared';

interface TripCardProps {
    trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
    const now = useNow();
    const format = useFormatter();
    const t = useTranslations('Trips');

    const roleColors = {
        driver: "bg-blue-500/10 text-blue-600 border-blue-200",
        passenger: "bg-green-500/10 text-green-600 border-green-200",
        parcel: "bg-amber-500/10 text-amber-600 border-amber-200",
    };

    const roleLabels = {
        driver: "Водитель",
        passenger: "Пассажир",
        parcel: "Посылка",
    };

    const isIntercity = trip.trip_type === 'rideshare';

    return (
        <Card className="group overflow-hidden rounded-3xl border-none bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="p-5">
                <div className="flex flex-col gap-4">
                    {/* Header: Role and Time */}
                    <div className="flex items-center justify-between">
                        <Badge
                            variant="outline"
                            className={cn("rounded-full px-3 py-1 font-medium border-none", roleColors[trip.role])}
                        >
                            {roleLabels[trip.role]}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                                {format.relativeTime(new Date(trip.updated_at), now)}
                            </span>
                        </div>
                    </div>

                    {/* Route Section */}
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1 pt-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                            <div className="w-0.5 h-8 bg-dashed border-l-2 border-dashed border-muted-foreground/30" />
                            <MapPin className="h-3.5 w-3.5 text-red-500" />
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                            <h3 className="text-lg font-bold tracking-tight leading-tight">
                                {trip.from_location?.name}
                            </h3>
                            <h3 className="text-lg font-bold tracking-tight leading-tight">
                                {trip.to_location?.name}
                            </h3>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                            <span className="text-xl font-black text-primary">
                                {trip.price ? `${trip.price.toLocaleString()} сом` : "Договорная"}
                            </span>
                            {/* {isIntercity && (
                                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                                    Межгород
                                </span>
                            )} */}
                        </div>
                    </div>

                    {/* Meta info: Date, Seats */}
                    <div className="flex items-center gap-4 py-3 border-y border-dashed border-muted">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold">
                                {format.dateTime(new Date(trip.departure_date), {
                                    day: 'numeric',
                                    month: 'short',
                                })}
                                {trip.time && `, ${trip.time}`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {trip.role === 'parcel' ? (
                                <>
                                    <Package className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold">Посылка</span>
                                </>
                            ) : (
                                <>
                                    <Users className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold">
                                        {trip.seats} {trip.role === 'driver' ? 'мест' : 'пасс.'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer: User Profile and Action */}
                    <div className="flex items-center justify-between mt-1">
                        {trip.user?.username !== 'chat_parser_user' ? (
                            <Link href={`/users/${trip.user?.id}`} className="flex items-center gap-3 group/user">
                                <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-primary/10 transition-all group-hover/user:ring-primary/30">
                                    <AvatarImage src={trip.user?.data?.avatar_thumbnail} alt={trip.user?.username} />
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                        {trip.user?.username?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold group-hover/user:text-primary transition-colors">
                                        {trip.user?.username}
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-primary/5 px-1.5 py-0.5 rounded-full w-fit">
                                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                                        <span className="font-bold text-amber-600">
                                            {trip.user?.data?.rating || "5.0"}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div />
                        )}

                        <Button asChild className="rounded-2xl font-bold px-5 h-10 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
                            <Link href={`/trips/${trip.id}`}>
                                Детали
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
