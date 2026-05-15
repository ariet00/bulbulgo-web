import { useQuery } from '@tanstack/react-query'

import { bookingApi } from '@/apis/booking'

export const useCategories = (includeInactive = false) =>
  useQuery({
    queryKey: ['booking', 'categories', includeInactive],
    queryFn: () => bookingApi.listCategories(includeInactive),
  })

export const useServices = (params?: { category_id?: number; include_inactive?: boolean }) =>
  useQuery({
    queryKey: ['booking', 'services', params],
    queryFn: () => bookingApi.listServices(params),
  })

export const useAvailability = (params: { date: string; service_ids: number[] }) =>
  useQuery({
    queryKey: ['booking', 'availability', params.date, params.service_ids],
    queryFn: () => bookingApi.availability(params),
    enabled: params.service_ids.length > 0 && Boolean(params.date),
  })

export const useAppointments = (params?: { from?: string; to?: string; status?: string }) =>
  useQuery({
    queryKey: ['booking', 'appointments', params],
    queryFn: () => bookingApi.listAppointments(params),
  })

export const useSchedule = () =>
  useQuery({
    queryKey: ['booking', 'schedule'],
    queryFn: () => bookingApi.getSchedule(),
  })

export const useSettings = () =>
  useQuery({
    queryKey: ['booking', 'settings'],
    queryFn: () => bookingApi.getSettings(),
  })

export const useClients = (search?: string) =>
  useQuery({
    queryKey: ['booking', 'clients', search],
    queryFn: () => bookingApi.listClients({ search }),
  })

export const useRevenue = (params: { from?: string; to?: string; group_by?: 'day' | 'service' | 'client' }) =>
  useQuery({
    queryKey: ['booking', 'revenue', params],
    queryFn: () => bookingApi.revenue(params),
  })
