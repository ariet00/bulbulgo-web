export type StaffRole =
  | 'owner'
  | 'staff_manager'
  | 'staff_employee'
  | 'staff_accountant'
  | 'unknown'

export type StaffUser = {
  id: number
  name: string | null
  surname: string | null
  phone: string | null
  username: string | null
}

export type StaffCompany = {
  id: number
  slug: string
  name: string
}

export type StaffBot = {
  id: number
  slug: string
  name: string | null
}

export type StaffMe = {
  user: StaffUser
  company: StaffCompany
  bot: StaffBot
  role: StaffRole
  is_owner: boolean
}

export type WorkplacePublic = {
  workplace_id: number
  name: string
  company_id: number
  company_name: string
  address: string | null
  is_active: boolean
}

export type CheckinResult = {
  entry_id: number
  action: 'check_in' | 'check_out'
  date: string
  check_in_at: string | null
  check_out_at: string | null
  total_minutes: number
  overtime_minutes: number
  late_minutes: number
}

export type TimeEntry = {
  id: number
  company_id: number
  branch_id: number | null
  user_id: number
  date: string
  check_in_at: string | null
  check_out_at: string | null
  total_minutes: number
  overtime_minutes: number
  late_minutes: number
  method: 'qr' | 'manual' | 'geo'
  status: 'pending' | 'approved' | 'rejected'
  notes: string | null
}

export type TimelogSummaryRow = {
  user_id: number
  display_name: string
  days_worked: number
  total_minutes: number
  overtime_minutes: number
  late_minutes: number
}

export type TimelogSummary = {
  year: number
  month: number
  rows: TimelogSummaryRow[]
  grand_total_minutes: number
  grand_overtime_minutes: number
}

export type BonusRule = {
  name: string
  amount: number
  condition?: string | null
}

export type SalaryFormula = {
  overtime_multiplier: number
  tax_rate: number
  social_rate: number
  late_fine_per_min: number
  absence_fine_per_day: number
  bonuses: BonusRule[]
}

export type LeavePolicy = {
  default_days_per_year: number
  carryover_rule: 'next_year' | 'expire' | 'pay_out'
}

export type ShiftTemplate = {
  key: string
  name: string
  start: string
  end: string
}

export type NotificationsEnabled = {
  missed_checkin: boolean
  end_of_shift: boolean
  shift_reminder: boolean
  payroll: boolean
  leaves: boolean
  birthday: boolean
  contract_expiry: boolean
}

export type StaffSettingsData = {
  country: string
  tariff: string
  work_day_hours: number
  overtime_threshold_min: number
  holidays: string[]
  shift_templates: ShiftTemplate[]
  leave_policy: LeavePolicy
  salary_formula: SalaryFormula
  notifications_enabled: NotificationsEnabled
}

export type StaffSettings = {
  timezone: string
  currency_code: string | null
  data: StaffSettingsData
}

export type PayrollEntryItem = {
  id: number
  user_id: number
  display_name: string | null
  hours_worked: number
  days_worked: number
  overtime_hours: number
  bonuses: number
  fines: number
  gross: number
  tax: number
  social: number
  net: number
  breakdown: Record<string, any>
}

export type PayrollPeriodItem = {
  id: number
  company_id: number
  year: number
  month: number
  status: 'draft' | 'calculated' | 'approved' | 'paid'
  total_amount: number
  formula_snapshot: Record<string, any>
  approved_at: string | null
  approved_by_user_id: number | null
}

export type PayrollPeriodDetail = PayrollPeriodItem & {
  entries: PayrollEntryItem[]
  currency_code: string | null
}

export type ShiftStatus = 'scheduled' | 'confirmed' | 'swapped' | 'cancelled'

export type ShiftItem = {
  id: number
  company_id: number
  branch_id: number | null
  user_id: number
  date: string
  start_at: string
  end_at: string
  status: ShiftStatus
  template_key: string | null
  notes: string | null
}

export type ShiftCreatePayload = {
  user_id: number
  branch_id?: number | null
  date: string
  start_at: string
  end_at: string
  template_key?: string | null
  notes?: string | null
}

export type ShiftUpdatePayload = Partial<ShiftCreatePayload> & {
  status?: ShiftStatus
}

export type ShiftSwapItem = {
  id: number
  from_shift_id: number
  to_shift_id: number | null
  from_user_id: number
  to_user_id: number | null
  status: 'pending' | 'accepted' | 'approved' | 'rejected'
  approver_user_id: number | null
  approved_at: string | null
  notes: string | null
}

export type ShiftSwapAction = {
  action: 'accept' | 'reject' | 'approve' | 'cancel'
  to_shift_id?: number
  notes?: string
}

export type EmployeeItem = {
  user_id: number
  is_owner: boolean
  status: string
  role_slug: string | null
  display_name: string
  phone: string | null
}

export type LeaveType = 'vacation' | 'sick' | 'unpaid' | 'other'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export type LeaveItem = {
  id: number
  company_id: number
  user_id: number
  type: LeaveType
  starts_at: string
  ends_at: string
  days_count: number
  status: LeaveStatus
  document_url: string | null
  manager_comment: string | null
  reviewed_by_user_id: number | null
  reviewed_at: string | null
}

export type LeaveBalance = {
  year: number
  default_per_year: number
  carryover: number
  used: number
  balance: number
}

export type LeaveCalendarEntry = {
  leave_id: number
  user_id: number
  display_name: string
  type: LeaveType
  starts_at: string
  ends_at: string
  days_count: number
}

export type LeaveCalendar = {
  year: number
  month: number
  entries: LeaveCalendarEntry[]
}

export type KbArticleListItem = {
  id: number
  title: string
  category: string | null
  tags: string[]
  is_published: boolean
  required_for_role_id: number | null
  created_at: string
  read_count: number
  is_read: boolean
}

export type KbArticleItem = {
  id: number
  company_id: number
  title: string
  content: string
  category: string | null
  tags: string[]
  is_published: boolean
  required_for_role_id: number | null
  created_at: string
}

export type KbReader = {
  user_id: number
  display_name: string
  read_at: string
}

export type KbReadersList = {
  article_id: number
  total_required: number
  readers: KbReader[]
}
