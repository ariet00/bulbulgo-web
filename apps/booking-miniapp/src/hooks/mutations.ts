import { useMutation, useQueryClient } from '@tanstack/react-query'

import { bookingApi } from '@/apis/booking'
import { useBookingStore } from '@/store/useBookingStore'

const invalidateAppointments = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: ['booking', 'appointments'] })

export const useCreateAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bookingApi.createAppointment,
    onSuccess: () => {
      invalidateAppointments(qc)
      qc.invalidateQueries({ queryKey: ['booking', 'availability'] })
    },
  })
}

export const useUpdateAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Parameters<typeof bookingApi.updateAppointment>[1] }) =>
      bookingApi.updateAppointment(id, patch),
    onSuccess: () => {
      invalidateAppointments(qc)
      qc.invalidateQueries({ queryKey: ['booking', 'availability'] })
    },
  })
}

export const useCompleteAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof bookingApi.completeAppointment>[1] }) =>
      bookingApi.completeAppointment(id, body),
    onSuccess: () => {
      invalidateAppointments(qc)
      qc.invalidateQueries({ queryKey: ['booking', 'revenue'] })
      qc.invalidateQueries({ queryKey: ['booking', 'clients'] })
    },
  })
}

export const useCancelAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => bookingApi.cancelAppointment(id, reason),
    onSuccess: () => invalidateAppointments(qc),
  })
}

export const useNoShowAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bookingApi.noShowAppointment(id),
    onSuccess: () => invalidateAppointments(qc),
  })
}

export const useCreateService = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bookingApi.createService,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'services'] }),
  })
}

export const useUpdateService = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Parameters<typeof bookingApi.updateService>[1] }) =>
      bookingApi.updateService(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'services'] }),
  })
}

export const useUpdateSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bookingApi.updateSettings,
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['booking', 'settings'] })
      useBookingStore.getState().setSettings(updated)
    },
  })
}

export const useReplaceSchedule = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bookingApi.replaceSchedule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'schedule'] }),
  })
}
