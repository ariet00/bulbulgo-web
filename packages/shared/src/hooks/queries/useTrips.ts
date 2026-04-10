import { useQuery } from '@tanstack/react-query';
import { getTrips, getTrip, getTripPhone } from '../../apis/trips';
import { TripFilter } from '../../types/trip';

export const useTrips = (filters: TripFilter = {}) => {
    return useQuery({
        queryKey: ['trips', filters],
        queryFn: () => getTrips(filters),
    });
};

export const useTrip = (id: number) => {
    return useQuery({
        queryKey: ['trip', id],
        queryFn: () => getTrip(id),
        enabled: !!id,
    });
};

export const useTripPhone = (id: number, role?: string, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['trip-phone', id, role],
        queryFn: () => getTripPhone(id, role),
        enabled: enabled && !!id,
    });
};
