import { requests } from './base'

// ── Reference-data seeders (mirrors backend apps/seeding_admin/admin/router.py) ──

export interface SeederItem {
    name: string
    ownership: 'code' | 'operator'
    requires: string[]
    guarded: boolean
    in_startup: boolean
}

export interface SeederRunRequest {
    names: string[]
    force?: boolean
}

export interface SeederRunResult {
    name: string
    status: 'done' | 'skipped' | 'failed'
    error: string | null
}

export const seedersAdminApi = {
    listSeeders: () => requests.get<SeederItem[]>('/admin/seeders'),
    runSeeders: (data: SeederRunRequest) =>
        requests.post<SeederRunResult[]>('/admin/seeders/run', data),
}
