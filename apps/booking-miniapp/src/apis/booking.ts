import { api } from '@/lib/api'
import type {
  Appointment,
  AvailabilitySlot,
  BookingScheduleItem,
  BookingScheduleOverride,
  BookingScheduleOverrideUpsert,
  BookingSettings,
  BookingTimeOff,
  Business,
  Client,
  Currency,
  Employee,
  InviteAcceptResponse,
  InviteCreated,
  RevenueReport,
  SchedulePatternType,
  Service,
  ServiceCategory,
  Transaction,
} from '@/types/booking'

const root = '/api/v1/booking'

export const bookingApi = {
  // bootstrap
  business: () => api.get<Business>(`${root}/business`).then((r) => r.data),

  // settings
  getSettings: () => api.get<BookingSettings>(`${root}/settings`).then((r) => r.data),
  updateSettings: (patch: Partial<BookingSettings>) =>
    api.patch<BookingSettings>(`${root}/settings`, patch).then((r) => r.data),

  // categories
  listCategories: (includeInactive = false) =>
    api
      .get<ServiceCategory[]>(`${root}/categories`, { params: { include_inactive: includeInactive } })
      .then((r) => r.data),
  createCategory: (body: { name: string; icon?: string | null; order?: number; is_active?: boolean }) =>
    api.post<ServiceCategory>(`${root}/categories`, body).then((r) => r.data),
  updateCategory: (id: number, patch: Partial<ServiceCategory>) =>
    api.patch<ServiceCategory>(`${root}/categories/${id}`, patch).then((r) => r.data),
  deleteCategory: (id: number) => api.delete(`${root}/categories/${id}`).then((r) => r.data),

  // services
  listServices: (params?: { category_id?: number; include_inactive?: boolean }) =>
    api.get<Service[]>(`${root}/services`, { params }).then((r) => r.data),
  createService: (body: Partial<Service> & { name: string; duration_min: number }) =>
    api.post<Service>(`${root}/services`, body).then((r) => r.data),
  updateService: (id: number, patch: Partial<Service>) =>
    api.patch<Service>(`${root}/services/${id}`, patch).then((r) => r.data),
  deleteService: (id: number) => api.delete(`${root}/services/${id}`).then((r) => r.data),

  // schedule
  getSchedule: (params?: { user_id?: number | null }) =>
    api
      .get<BookingScheduleItem[]>(`${root}/schedule`, {
        params: params?.user_id != null ? { user_id: params.user_id } : undefined,
      })
      .then((r) => r.data),
  replaceSchedule: (items: BookingScheduleItem[], params?: { user_id?: number | null }) =>
    api
      .put<BookingScheduleItem[]>(`${root}/schedule`, { items }, {
        params: params?.user_id != null ? { user_id: params.user_id } : undefined,
      })
      .then((r) => r.data),
  applySchedulePreset: (body: {
    type: SchedulePatternType
    start_time?: string
    end_time?: string
    user_id?: number | null
  }) =>
    api
      .post<{ settings: BookingSettings; schedule: BookingScheduleItem[] }>(
        `${root}/schedule/preset`,
        body,
      )
      .then((r) => r.data),

  // schedule overrides (per-date hour customisation)
  listScheduleOverrides: (params: { from: string; to: string; user_id?: number | null }) =>
    api
      .get<BookingScheduleOverride[]>(`${root}/schedule/overrides`, {
        params: {
          from: params.from,
          to: params.to,
          ...(params.user_id != null ? { user_id: params.user_id } : {}),
        },
      })
      .then((r) => r.data),
  upsertScheduleOverrides: (body: {
    items: BookingScheduleOverrideUpsert[]
    user_id?: number | null
  }) =>
    api
      .post<BookingScheduleOverride[]>(`${root}/schedule/overrides/batch`, body)
      .then((r) => r.data),
  deleteScheduleOverride: (overrideDate: string, params?: { user_id?: number | null }) =>
    api
      .delete(`${root}/schedule/overrides/${overrideDate}`, {
        params: params?.user_id != null ? { user_id: params.user_id } : undefined,
      })
      .then((r) => r.data),

  // currencies (global, not bot-scoped)
  listCurrencies: () => api.get<Currency[]>('/api/v1/currencies/').then((r) => r.data),

  // employees (Юр-companies)
  listEmployees: () => api.get<Employee[]>(`${root}/employees`).then((r) => r.data),
  createInvite: () => api.post<InviteCreated>(`${root}/employees/invite`).then((r) => r.data),
  acceptInvite: (token: string) =>
    api.post<InviteAcceptResponse>(`${root}/employees/invite/${token}/accept`).then((r) => r.data),
  updateEmployee: (
    userId: number,
    body: { display_name?: string; color?: string; position?: string; status?: string },
  ) => api.patch<Employee>(`${root}/employees/${userId}`, body).then((r) => r.data),
  deleteEmployee: (userId: number) =>
    api.delete<{ ok: boolean }>(`${root}/employees/${userId}`).then((r) => r.data),

  // time-off
  listTimeOff: (params?: { from?: string; to?: string }) =>
    api.get<BookingTimeOff[]>(`${root}/time-off`, { params }).then((r) => r.data),
  createTimeOff: (body: { starts_at: string; ends_at: string; reason?: string }) =>
    api.post<BookingTimeOff>(`${root}/time-off`, body).then((r) => r.data),
  deleteTimeOff: (id: number) => api.delete(`${root}/time-off/${id}`).then((r) => r.data),

  // availability
  availability: (params: { date: string; service_ids: number[]; staff_id?: number | null }) =>
    api
      .get<AvailabilitySlot[]>(`${root}/availability`, {
        params: {
          date: params.date,
          service_ids: params.service_ids,
          ...(params.staff_id != null ? { staff_id: params.staff_id } : {}),
        },
        paramsSerializer: { indexes: null },
      })
      .then((r) => r.data),

  // clients
  listClients: (params?: { search?: string; limit?: number; offset?: number }) =>
    api.get<Client[]>(`${root}/clients`, { params }).then((r) => r.data),
  createClient: (body: { name: string; phone?: string; notes?: string }) =>
    api.post<Client>(`${root}/clients`, body).then((r) => r.data),

  // appointments
  listAppointments: (params?: {
    from?: string
    to?: string
    status?: string
    staff_id?: number | null
    limit?: number
  }) =>
    api.get<Appointment[]>(`${root}/appointments`, { params }).then((r) => r.data),
  getAppointment: (id: number) => api.get<Appointment>(`${root}/appointments/${id}`).then((r) => r.data),
  createAppointment: (body: {
    starts_at: string
    service_ids: number[]
    staff_id?: number | null
    notes?: string
    client_id?: number
    client_name?: string
    client_phone?: string
  }) => api.post<Appointment>(`${root}/appointments`, body).then((r) => r.data),
  updateAppointment: (
    id: number,
    patch: { starts_at?: string; service_ids?: number[]; notes?: string },
  ) => api.patch<Appointment>(`${root}/appointments/${id}`, patch).then((r) => r.data),
  completeAppointment: (id: number, body: { paid_amount?: string; payment_method?: string }) =>
    api.post<Appointment>(`${root}/appointments/${id}/complete`, body).then((r) => r.data),
  cancelAppointment: (id: number, reason?: string) =>
    api.post<Appointment>(`${root}/appointments/${id}/cancel`, { reason }).then((r) => r.data),
  noShowAppointment: (id: number) =>
    api.post<Appointment>(`${root}/appointments/${id}/no-show`, {}).then((r) => r.data),

  // finance
  listTransactions: (params?: { from?: string; to?: string; type?: string; limit?: number }) =>
    api.get<Transaction[]>(`${root}/transactions`, { params }).then((r) => r.data),
  revenue: (params: { from?: string; to?: string; group_by?: 'day' | 'service' | 'client' }) =>
    api.get<RevenueReport>(`${root}/reports/revenue`, { params }).then((r) => r.data),
}
