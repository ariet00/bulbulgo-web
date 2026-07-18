import { requests } from './base'

// ── Runtime monitoring (mirrors backend apps/celery_admin/admin/monitoring.py) ──

export interface CeleryWorkerStats {
    // Celery's inspect().stats() shape is loose — keep it open.
    pool?: { 'max-concurrency'?: number; processes?: number[] }
    total?: Record<string, number>
    uptime?: number
    clock?: string
    [key: string]: unknown
}

export interface CeleryWorker {
    hostname: string
    online: boolean
    stats: CeleryWorkerStats | null
    registered: string[]
}

export interface CeleryWorkersResponse {
    workers: CeleryWorker[]
    count: number
}

export interface CeleryActiveTask {
    id: string
    name: string
    args?: unknown[]
    kwargs?: Record<string, unknown>
    time_start?: number | null
    worker_pid?: number
    hostname?: string
    delivery_info?: { routing_key?: string }
    [key: string]: unknown
}

export interface CeleryActiveResponse {
    // Keyed by worker hostname → list of tasks.
    active: Record<string, CeleryActiveTask[]>
    reserved: Record<string, CeleryActiveTask[]>
    scheduled: Record<string, unknown[]>
}

export interface CeleryTaskRunItem {
    id: number
    task_id: string
    name: string
    status: string
    worker: string | null
    queue: string | null
    retries: number
    runtime_ms: number | null
    started_at: string | null
    finished_at: string | null
    created_at: string
}

export interface CeleryTaskRunDetail extends CeleryTaskRunItem {
    args: unknown[] | null
    kwargs: Record<string, unknown> | null
    result: string | null
    traceback: string | null
}

export interface CeleryTaskRunList {
    items: CeleryTaskRunItem[]
    total: number
    page: number
    size: number
}

export interface CeleryTaskRunSummary {
    window_hours: number
    by_status: { status: string; count: number }[]
    top_failed: { name: string; count: number }[]
}

export interface CeleryRunsFilters {
    status?: string
    name?: string
    worker?: string
    q?: string
    started_from?: string
    started_to?: string
    page?: number
    size?: number
}

function buildRunsQuery(f: CeleryRunsFilters): string {
    const p = new URLSearchParams()
    if (f.status) p.set('status', f.status)
    if (f.name) p.set('name', f.name)
    if (f.worker) p.set('worker', f.worker)
    if (f.q) p.set('q', f.q)
    if (f.started_from) p.set('started_from', f.started_from)
    if (f.started_to) p.set('started_to', f.started_to)
    p.set('page', String(f.page ?? 1))
    p.set('size', String(f.size ?? 50))
    return p.toString()
}

export const celeryAdminApi = {
    getCeleryWorkers: () =>
        requests.get<CeleryWorkersResponse>('/admin/celery/workers'),
    getCeleryActive: () =>
        requests.get<CeleryActiveResponse>('/admin/celery/active'),
    listCeleryRuns: (filters: CeleryRunsFilters = {}) =>
        requests.get<CeleryTaskRunList>(
            `/admin/celery/runs?${buildRunsQuery(filters)}`
        ),
    getCeleryRun: (id: number) =>
        requests.get<CeleryTaskRunDetail>(`/admin/celery/runs/${id}`),
    getCeleryRunsSummary: (windowHours = 24) =>
        requests.get<CeleryTaskRunSummary>(
            `/admin/celery/runs/summary?window_hours=${windowHours}`
        ),
}
