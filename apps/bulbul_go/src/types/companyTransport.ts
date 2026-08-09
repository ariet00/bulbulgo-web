import type { Region, TripUser } from '@doska/shared';

// ── Fleet vehicles ────────────────────────────────────────────────
export interface CompanyVehicle {
    id: number;
    user_id: number;
    company_id?: number | null;
    brand: string;
    model: string;
    color?: string | null;
    plate_number?: string | null;
    year?: number | null;
    vehicle_type?: string | null;
    data?: Record<string, any> | null;
}

export interface CompanyVehicleCreate {
    brand: string;
    model: string;
    color?: string;
    plate_number?: string;
    year?: number;
    vehicle_type?: string;
}

export type CompanyVehicleUpdate = Partial<CompanyVehicleCreate>;

// ── Drivers (CompanyEmployee with the driver role) ───────────────
export interface Driver {
    user_id: number;
    company_id: number;
    status: string;
    full_name: string;
    phone?: string | null;
    license_number?: string | null;
    license_categories?: string | null;
    default_vehicle_id?: number | null;
    user?: TripUser | null;
}

export interface DriverCreate {
    full_name: string;
    phone?: string;
    license_number?: string;
    license_categories?: string;
    default_vehicle_id?: number | null;
    user_id?: number | null;
}

export interface DriverUpdate {
    full_name?: string;
    phone?: string;
    license_number?: string;
    license_categories?: string;
    default_vehicle_id?: number | null;
    status?: string;
}

// ── Company trips ────────────────────────────────────────────────
export interface CompanyTripSchedule {
    id: number;
    date: string;
    time?: string | null;
    seats?: number | null;
}

export interface CompanyTrip {
    id: number;
    user_id: number;
    company_id?: number | null;
    role: string;
    trip_type?: string | null;
    from_location_id: number;
    to_location_id: number;
    from_location?: Region | null;
    to_location?: Region | null;
    departure_date?: string | null;
    time?: string | null;
    seats?: number | null;
    price?: number | null;
    currency_id?: number | null;
    status: string;
    vehicle_id?: number | null;
    vehicle?: CompanyVehicle | null;
    user?: TripUser | null;
    schedules?: CompanyTripSchedule[];
}

export interface CompanyTripScheduleCreate {
    date: string;
    time?: string | null;
    seats?: number | null;
}

export interface CompanyTripCreate {
    role: string;
    trip_type?: string;
    from_location_id: number;
    to_location_id: number;
    departure_date?: string | null;
    time?: string | null;
    seats?: number | null;
    price?: number | null;
    currency_id?: number | null;
    comment?: string | null;
    vehicle_id?: number | null;
    driver_user_id?: number | null;
    schedules?: CompanyTripScheduleCreate[];
}

export interface CompanyTripUpdate {
    trip_type?: string;
    departure_date?: string | null;
    time?: string | null;
    seats?: number | null;
    price?: number | null;
    status?: string;
    vehicle_id?: number | null;
}

export interface TripAssignment {
    driver_user_id?: number | null;
    vehicle_id?: number | null;
}

export interface CompanyTripFilters {
    status?: string;
    trip_type?: string;
    departure_date?: string;
}
