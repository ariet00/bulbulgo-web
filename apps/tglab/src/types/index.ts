/** Mirrors the Pydantic schemas of `backend/apps/tglab/schemas/`. */

export interface TglabQuotas {
  max_accounts: number
  max_running_tasks: number
}

export interface TglabUser {
  id: number
  username: string
  email: string | null
  full_name: string | null
  role_slug: string | null
  /** Expanded (wildcards resolved) `tglab.*` slugs the role grants. */
  permissions: string[]
  quotas: TglabQuotas
}

export interface TglabSession {
  access_token: string
  refresh_token: string
  token_type: string
  user: TglabUser
}

export interface Project {
  id: number
  name: string
  note: string | null
  color: string | null
  created_at: string
  accounts_count: number
  proxies_count: number
  audiences_count: number
  tasks_count: number
}

export interface ProjectInput {
  name: string
  note?: string | null
  color?: string | null
}

export interface MetaOption {
  value: string
  label: string
}

export interface MetaFlag {
  value: number
  label: string
}

/** GET /tglab/meta — every value set of the domain with its label. */
export interface TglabMeta {
  task_types: MetaOption[]
  task_statuses: MetaOption[]
  task_account_roles: MetaOption[]
  account_statuses: MetaOption[]
  proxy_types: MetaOption[]
  proxy_statuses: MetaOption[]
  audience_kinds: MetaOption[]
  audience_flags: MetaFlag[]
  action_types: MetaOption[]
  action_statuses: MetaOption[]
  log_levels: MetaOption[]
  account_limit_keys: string[]
  default_account_limits: Record<string, number>
}
