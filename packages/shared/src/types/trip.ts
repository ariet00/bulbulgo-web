import { UserPublic } from './user';
import { Region } from './region';
import { Vehicle } from './vehicle';

export type TripRole = 'driver' | 'passenger' | 'parcel';
export type TripType = 'rideshare' | 'rideshare_city';
export type TripStatus = 'active' | 'processing' | 'archived' | 'cancelled';

export interface TripWaypoint {
    id: number;
    trip_id: number;
    region_id: number;
    order: number;
    region?: Region;
}

export interface Trip {
    id: number;
    user_id: number;
    role: TripRole;
    trip_type: TripType;
    from_location_id: number;
    to_location_id: number;
    price: number;
    seats: number;
    departure_date: string;
    time?: string;
    comment?: string;
    status: TripStatus;
    phone?: string;
    expire_at?: string;
    created_at: string;
    updated_at: string;
    
    // Relations
    user?: UserPublic;
    from_location?: Region;
    to_location?: Region;
    vehicle?: Vehicle;
    waypoints?: TripWaypoint[];
    
    // JSONB data field
    data?: {
        multi_dates?: string[];
        is_full_car?: boolean;
        is_city_trip?: boolean;
        allow_booking?: boolean;
        allow_messages?: boolean;
        pref_smoking_allowed?: boolean;
        pref_baggage_allowed?: boolean;
        pref_door_to_door?: boolean;
        pref_takes_packages?: boolean;
        pref_air_conditioning?: boolean;
        pref_roof_box?: boolean;
        [key: string]: any;
    };
}

export interface TripFilter {
    from_location?: number;
    to_location?: number;
    trip_type?: TripType;
    role?: TripRole;
    min_price?: number;
    max_price?: number;
    departure_date?: string;
    seats?: number;
    is_full_car?: boolean;
    pref_smoking_allowed?: boolean;
    pref_baggage_allowed?: boolean;
    pref_door_to_door?: boolean;
    pref_takes_packages?: boolean;
    pref_air_conditioning?: boolean;
    pref_roof_box?: boolean;
    skip?: number;
    limit?: number;
}
