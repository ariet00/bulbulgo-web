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
    mutationFn: ({ items, user_id }: { items: Parameters<typeof bookingApi.replaceSchedule>[0]; user_id?: number | null }) =>
      bookingApi.replaceSchedule(items, user_id != null ? { user_id } : undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'schedule'] }),
  })
}

export const useCreateInvite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bookingApi.createInvite,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'employees'] }),
  })
}

export const useAcceptInvite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => bookingApi.acceptInvite(token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', 'employees'] })
      qc.invalidateQueries({ queryKey: ['booking', 'business'] })
    },
  })
}

export const useUpdateEmployee = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, body }: { userId: number; body: Parameters<typeof bookingApi.updateEmployee>[1] }) =>
      bookingApi.updateEmployee(userId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'employees'] }),
  })
}

export const useDeleteEmployee = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => bookingApi.deleteEmployee(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', 'employees'] }),
  })
}

export const useApplySchedulePreset = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bookingApi.applySchedulePreset,
    onSuccess: ({ settings }) => {
      qc.invalidateQueries({ queryKey: ['booking', 'schedule'] })
      qc.invalidateQueries({ queryKey: ['booking', 'settings'] })
      qc.invalidateQueries({ queryKey: ['booking', 'availability'] })
      useBookingStore.getState().setSettings(settings)
    },
  })
}
