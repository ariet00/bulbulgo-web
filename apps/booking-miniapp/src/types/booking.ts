export type Business = {
  company: {
    id: number
    slug: string
    name: string
    description?: string | null
    type?: string | null
    legal_form?: 'ip' | 'legal'
  }
  is_owner: boolean
  is_staff?: boolean
  settings: BookingSettings | null
}

export type SchedulePatternType = '5/2' | '6/1' | '7/0' | '2/2' | '1/1' | '3/3' | 'custom'

export type SchedulePattern = {
  type: SchedulePatternType
  anchor_date?: string | null
}

export type BookingSettings = {
  id: number
  company_id: number
  timezone: string
  currency: string
  min_lead_time_min: number
  max_horizon_days: number
  cancellation_window_min: number
  auto_confirm: boolean
  reminder_24h_enabled: boolean
  reminder_2h_enabled: boolean
  schedule_pattern?: SchedulePattern | null
}

export type Currency = {
  id: number
  code: string
  symbol: string
  name: string
}

export type Employee = {
  user_id: number
  is_owner: boolean
  status: string
  display_name: string
  phone?: string | null
  color?: string | null
  position?: string | null
}

export type InviteCreated = {
  token: string
  url: string
  expires_at: string
}

export type InviteAcceptResponse = {
  company_id: number
  is_staff: boolean
}

export type ServiceCategory = {
  id: number
  company_id: number
  name: string
  icon?: string | null
  order: number
  is_active: boolean
}

export type Service = {
  id: number
  company_id: number
  category_id: number | null
  name: string
  description?: string | null
  duration_min: number
  price: string
  photo_url?: string | null
  buffer_before_min: number
  buffer_after_min: number
  is_active: boolean
  staff_ids?: number[]
}

export type Client = {
  id: number
  company_id: number
  user_id: number | null
  name: string
  phone?: string | null
  telegram_id?: string | null
  notes?: string | null
  visits_count: number
  total_spent: string
  first_visit_at?: string | null
  last_visit_at?: string | null
}

export type AppointmentService = {
  id: number
  service_id: number
  price_snapshot: string
  duration_min_snapshot: number
  service?: Service | null
}

export type Appointment = {
  id: number
  company_id: number
  client_id: number
  staff_id?: number | null
  starts_at: string
  ends_at: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  total_price: string
  paid_amount: string
  payment_method?: string | null
  notes?: string | null
  source: string
  created_at?: string | null
  updated_at?: string | null
  client?: Client | null
  services: AppointmentService[]
}

export type AvailabilitySlot = {
  start: string
  end: string
}

export type BookingScheduleItem = {
  weekday: number
  start_time: string | null
  end_time: string | null
  is_working_day: boolean
}

export type BookingTimeOff = {
  id: number
  company_id: number
  starts_at: string
  ends_at: string
  reason?: string | null
}

export type Transaction = {
  id: number
  company_id: number
  appointment_id?: number | null
  type: string
  category?: string | null
  amount: string
  payment_method?: string | null
  occurred_at: string
  comment?: string | null
}

export type RevenueReport = {
  total: string
  count: number
  breakdown: { key: string; label?: string | null; amount: string; count: number }[]
}
