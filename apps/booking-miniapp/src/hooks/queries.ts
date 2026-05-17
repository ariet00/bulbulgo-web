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

export const useAvailability = (params: { date: string; service_ids: number[]; staff_id?: number | null }) =>
  useQuery({
    queryKey: ['booking', 'availability', params.date, params.service_ids, params.staff_id ?? null],
    queryFn: () => bookingApi.availability(params),
    enabled: params.service_ids.length > 0 && Boolean(params.date),
  })

export const useAppointments = (params?: {
  from?: string
  to?: string
  status?: string
  staff_id?: number | null
}) =>
  useQuery({
    queryKey: ['booking', 'appointments', params],
    queryFn: () => bookingApi.listAppointments(params),
  })

export const useSchedule = (userId?: number | null) =>
  useQuery({
    queryKey: ['booking', 'schedule', userId ?? null],
    queryFn: () => bookingApi.getSchedule({ user_id: userId ?? null }),
  })

export const useScheduleOverrides = (params: {
  from: string
  to: string
  userId?: number | null
}) =>
  useQuery({
    queryKey: ['booking', 'schedule-overrides', params.userId ?? null, params.from, params.to],
    queryFn: () =>
      bookingApi.listScheduleOverrides({
        from: params.from,
        to: params.to,
        user_id: params.userId ?? null,
      }),
    enabled: Boolean(params.from && params.to),
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

export const useCurrencies = () =>
  useQuery({
    queryKey: ['booking', 'currencies'],
    queryFn: () => bookingApi.listCurrencies(),
    staleTime: 24 * 60 * 60 * 1000,
  })

export const useEmployees = () =>
  useQuery({
    queryKey: ['booking', 'employees'],
    queryFn: () => bookingApi.listEmployees(),
  })
