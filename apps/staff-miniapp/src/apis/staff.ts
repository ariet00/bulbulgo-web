import { api } from '@/lib/api'
import type {
  CheckinResult,
  EmployeeItem,
  KbArticleItem,
  KbArticleListItem,
  KbReadersList,
  LeaveBalance,
  LeaveCalendar,
  LeaveItem,
  LeaveStatus,
  LeaveType,
  PayrollPeriodDetail,
  PayrollPeriodItem,
  ShiftCreatePayload,
  ShiftItem,
  ShiftSwapAction,
  ShiftSwapItem,
  ShiftUpdatePayload,
  StaffMe,
  StaffSettings,
  StaffSettingsData,
  TimeEntry,
  TimelogSummary,
  WorkplacePublic,
} from '@/types/staff'

type TimelogFilter = {
  user_id?: number
  from?: string
  to?: string
  status?: 'pending' | 'approved' | 'rejected'
}

export const staffApi = {
  async me(): Promise<StaffMe> {
    const res = await api.get<StaffMe>('/api/v1/staff/me')
    return res.data
  },

  async getWorkplaceByToken(qrToken: string): Promise<WorkplacePublic> {
    const res = await api.get<WorkplacePublic>(
      `/api/v1/staff/checkin/${encodeURIComponent(qrToken)}/workplace`,
    )
    return res.data
  },

  async checkinByToken(qrToken: string): Promise<CheckinResult> {
    const res = await api.post<CheckinResult>(
      `/api/v1/staff/checkin/${encodeURIComponent(qrToken)}`,
    )
    return res.data
  },

  async listTimelog(filter: TimelogFilter = {}): Promise<TimeEntry[]> {
    const res = await api.get<TimeEntry[]>('/api/v1/staff/timelog', {
      params: filter,
    })
    return res.data
  },

  async timelogSummary(year: number, month: number): Promise<TimelogSummary> {
    const res = await api.get<TimelogSummary>('/api/v1/staff/timelog/summary', {
      params: { year, month },
    })
    return res.data
  },

  async approveEntry(entryId: number): Promise<TimeEntry> {
    const res = await api.post<TimeEntry>(
      `/api/v1/staff/timelog/${entryId}/approve`,
    )
    return res.data
  },

  async rejectEntry(entryId: number, reason?: string): Promise<TimeEntry> {
    const res = await api.post<TimeEntry>(
      `/api/v1/staff/timelog/${entryId}/reject`,
      null,
      { params: reason ? { reason } : undefined },
    )
    return res.data
  },

  // Payroll
  async listPayrollPeriods(year?: number, month?: number): Promise<PayrollPeriodItem[]> {
    const params: Record<string, number> = {}
    if (year !== undefined) params.year = year
    if (month !== undefined) params.month = month
    const res = await api.get<PayrollPeriodItem[]>('/api/v1/staff/payroll', { params })
    return res.data
  },

  async getPayrollPeriod(periodId: number): Promise<PayrollPeriodDetail> {
    const res = await api.get<PayrollPeriodDetail>(
      `/api/v1/staff/payroll/${periodId}`,
    )
    return res.data
  },

  async calculatePayroll(year: number, month: number): Promise<PayrollPeriodDetail> {
    const res = await api.post<PayrollPeriodDetail>(
      '/api/v1/staff/payroll/calculate',
      { year, month },
    )
    return res.data
  },

  async approvePayroll(periodId: number): Promise<PayrollPeriodItem> {
    const res = await api.patch<PayrollPeriodItem>(
      `/api/v1/staff/payroll/${periodId}/approve`,
    )
    return res.data
  },

  async sendPayslips(periodId: number): Promise<{ period_id: number; queued: number }> {
    const res = await api.post(`/api/v1/staff/payroll/${periodId}/send-payslips`)
    return res.data
  },

  // Settings
  async getSettings(): Promise<StaffSettings> {
    const res = await api.get<StaffSettings>('/api/v1/staff/settings')
    return res.data
  },

  async updateSettings(payload: {
    timezone?: string
    currency_code?: string
    data?: StaffSettingsData
  }): Promise<StaffSettings> {
    const res = await api.put<StaffSettings>('/api/v1/staff/settings', payload)
    return res.data
  },

  // Employees
  async listEmployees(): Promise<EmployeeItem[]> {
    const res = await api.get<EmployeeItem[]>('/api/v1/staff/employees')
    return res.data
  },

  // Shifts
  async listShifts(filter: {
    from?: string
    to?: string
    user_id?: number
    workplace_id?: number
    status?: 'scheduled' | 'confirmed' | 'swapped' | 'cancelled'
  } = {}): Promise<ShiftItem[]> {
    const res = await api.get<ShiftItem[]>('/api/v1/staff/shifts', { params: filter })
    return res.data
  },

  async createShift(body: ShiftCreatePayload): Promise<ShiftItem> {
    const res = await api.post<ShiftItem>('/api/v1/staff/shifts', body)
    return res.data
  },

  async createShiftsBulk(shifts: ShiftCreatePayload[]): Promise<ShiftItem[]> {
    const res = await api.post<ShiftItem[]>('/api/v1/staff/shifts/bulk', { shifts })
    return res.data
  },

  async updateShift(shiftId: number, body: ShiftUpdatePayload): Promise<ShiftItem> {
    const res = await api.patch<ShiftItem>(`/api/v1/staff/shifts/${shiftId}`, body)
    return res.data
  },

  async deleteShift(shiftId: number): Promise<void> {
    await api.delete(`/api/v1/staff/shifts/${shiftId}`)
  },

  async copyWeek(payload: {
    from_week_start: string
    to_week_start: string
    overwrite?: boolean
  }): Promise<ShiftItem[]> {
    const res = await api.post<ShiftItem[]>('/api/v1/staff/shifts/copy-week', payload)
    return res.data
  },

  async listOpenShifts(): Promise<ShiftItem[]> {
    const res = await api.get<ShiftItem[]>('/api/v1/staff/shifts/open')
    return res.data
  },

  // Swap requests
  async listSwapRequests(status?: 'pending' | 'accepted' | 'approved' | 'rejected'): Promise<ShiftSwapItem[]> {
    const res = await api.get<ShiftSwapItem[]>('/api/v1/staff/shifts/swap', {
      params: status ? { status } : undefined,
    })
    return res.data
  },

  async createSwapRequest(body: {
    from_shift_id: number
    to_shift_id?: number
    to_user_id?: number
    notes?: string
  }): Promise<ShiftSwapItem> {
    const res = await api.post<ShiftSwapItem>('/api/v1/staff/shifts/swap', body)
    return res.data
  },

  async actSwapRequest(swapId: number, body: ShiftSwapAction): Promise<ShiftSwapItem> {
    const res = await api.patch<ShiftSwapItem>(
      `/api/v1/staff/shifts/swap/${swapId}`,
      body,
    )
    return res.data
  },

  // Leaves
  async listLeaves(filter: { user_id?: number; status?: LeaveStatus } = {}): Promise<LeaveItem[]> {
    const res = await api.get<LeaveItem[]>('/api/v1/staff/leaves', { params: filter })
    return res.data
  },

  async createLeave(body: {
    type: LeaveType
    starts_at: string
    ends_at: string
    user_id?: number
    notes?: string
    document_url?: string
  }): Promise<LeaveItem> {
    const res = await api.post<LeaveItem>('/api/v1/staff/leaves', body)
    return res.data
  },

  async approveLeave(leaveId: number, manager_comment?: string): Promise<LeaveItem> {
    const res = await api.patch<LeaveItem>(
      `/api/v1/staff/leaves/${leaveId}/approve`,
      { manager_comment: manager_comment ?? null },
    )
    return res.data
  },

  async rejectLeave(leaveId: number, manager_comment?: string): Promise<LeaveItem> {
    const res = await api.patch<LeaveItem>(
      `/api/v1/staff/leaves/${leaveId}/reject`,
      { manager_comment: manager_comment ?? null },
    )
    return res.data
  },

  async deleteLeave(leaveId: number): Promise<void> {
    await api.delete(`/api/v1/staff/leaves/${leaveId}`)
  },

  async leaveBalance(userId: number, year?: number): Promise<LeaveBalance> {
    const res = await api.get<LeaveBalance>(
      `/api/v1/staff/leaves/balance/${userId}`,
      { params: year ? { year } : undefined },
    )
    return res.data
  },

  async leaveCalendar(year: number, month: number): Promise<LeaveCalendar> {
    const res = await api.get<LeaveCalendar>('/api/v1/staff/leaves/calendar', {
      params: { year, month },
    })
    return res.data
  },

  // Knowledge base
  async listKbArticles(filter: {
    category?: string
    role_id?: number
    published?: boolean
  } = {}): Promise<KbArticleListItem[]> {
    const res = await api.get<KbArticleListItem[]>('/api/v1/staff/kb/articles', {
      params: filter,
    })
    return res.data
  },

  async getKbArticle(id: number): Promise<KbArticleItem> {
    const res = await api.get<KbArticleItem>(`/api/v1/staff/kb/articles/${id}`)
    return res.data
  },

  async createKbArticle(body: {
    title: string
    content?: string
    category?: string | null
    tags?: string[]
    is_published?: boolean
    required_for_role_id?: number | null
  }): Promise<KbArticleItem> {
    const res = await api.post<KbArticleItem>('/api/v1/staff/kb/articles', body)
    return res.data
  },

  async updateKbArticle(id: number, body: Partial<{
    title: string
    content: string
    category: string | null
    tags: string[]
    is_published: boolean
    required_for_role_id: number | null
  }>): Promise<KbArticleItem> {
    const res = await api.patch<KbArticleItem>(`/api/v1/staff/kb/articles/${id}`, body)
    return res.data
  },

  async deleteKbArticle(id: number): Promise<void> {
    await api.delete(`/api/v1/staff/kb/articles/${id}`)
  },

  async publishKbArticle(id: number): Promise<KbArticleItem> {
    const res = await api.post<KbArticleItem>(`/api/v1/staff/kb/articles/${id}/publish`)
    return res.data
  },

  async markKbRead(id: number): Promise<void> {
    await api.post(`/api/v1/staff/kb/articles/${id}/read`)
  },

  async kbReaders(id: number): Promise<KbReadersList> {
    const res = await api.get<KbReadersList>(`/api/v1/staff/kb/articles/${id}/readers`)
    return res.data
  },

  async kbCategories(): Promise<string[]> {
    const res = await api.get<string[]>('/api/v1/staff/kb/categories')
    return res.data
  },

  async kbSearch(q: string): Promise<KbArticleListItem[]> {
    const res = await api.get<KbArticleListItem[]>('/api/v1/staff/kb/search', { params: { q } })
    return res.data
  },
}
