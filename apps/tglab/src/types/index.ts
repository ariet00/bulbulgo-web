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
  parse_modes: MetaOption[]
  invite_modes: MetaOption[]
  on_ban_modes: MetaOption[]
  mention_modes: MetaOption[]
  last_seen_filters: MetaOption[]
  max_audience_items: number
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


// ── proxies ───────────────────────────────────────────────────────────────────

export interface Proxy {
  id: number
  project_id: number | null
  type: string
  host: string
  port: number
  status: string
  checked_at: string | null
  name: string | null
  login: string | null
  /** The password itself never leaves the server. */
  has_password: boolean
  latency_ms: number | null
  external_ip: string | null
  last_error: string | null
  accounts_count: number
  created_at: string
}

export interface ProxyInput {
  type: string
  host: string
  port: number
  login?: string | null
  password?: string | null
  name?: string | null
  project_id?: number | null
}

export interface ProxyBulkInput {
  type: string
  raw: string
  project_id?: number | null
}

export interface ProxyBulkResult {
  created: Proxy[]
  /** Per-line complaints — the valid lines were still imported. */
  errors: string[]
}

// ── accounts ──────────────────────────────────────────────────────────────────

export interface Account {
  id: number
  project_id: number | null
  proxy_id: number | null
  proxy_label: string | null
  phone: string | null
  tg_user_id: number | null
  username: string | null
  status: string
  freezing_at: string | null
  is_frozen: boolean
  is_premium: boolean
  limits: Record<string, number>
  usage_today: Record<string, number>
  profile: { first_name?: string | null; last_name?: string | null; about?: string | null }
  last_error: { code?: string; message?: string; at?: string } | null
  spam_block: SpamBlock | null
  checked_at: string | null
  note: string | null
  has_session: boolean
  created_at: string
}

export interface AccountsPage {
  items: Account[]
  total: number
}

export interface AccountInput {
  session_string: string
  api_id?: number | null
  api_hash?: string | null
  twofa_password?: string | null
  phone?: string | null
  project_id?: number | null
  proxy_id?: number | null
}

export interface AccountUpdateInput {
  project_id?: number | null
  proxy_id?: number | null
  limits?: Record<string, number>
  note?: string | null
  /** 0 releases the account, N pauses it for N hours. */
  freeze_hours?: number | null
}

export interface AccountBulkInput extends AccountUpdateInput {
  ids: number[]
}

export interface AccountCheckResult {
  ok: boolean
  account: Account
  error_code: string | null
  error: string | null
}

export interface AccountSession {
  hash: number
  current: boolean
  device_model: string | null
  platform: string | null
  system_version: string | null
  app_name: string | null
  ip: string | null
  country: string | null
  date_active: string | null
}

export interface SpamBlock {
  text: string | null
  restricted: boolean
  checked_at: string | null
}

export interface AccountProfileInput {
  first_name?: string | null
  last_name?: string | null
  about?: string | null
  username?: string | null
}


// ── audiences ─────────────────────────────────────────────────────────────────

export interface CollectProgress {
  task_id: number | null
  status: string | null
  collected: number
  error: string | null
  finished_at: string | null
}

export interface Audience {
  id: number
  project_id: number | null
  name: string
  kind: string
  items_count: number
  note: string | null
  source: { type?: string; target?: string } | null
  /** State of the collection that filled (or is filling) this base. */
  collect: CollectProgress | null
  created_at: string
}

export interface AudienceInput {
  name: string
  kind: string
  project_id?: number | null
  note?: string | null
}

export interface AudienceCollectInput {
  name: string
  source: string
  mode: string
  account_id: number
  project_id?: number | null
  limit: number
  messages_limit?: number | null
  since_days?: number | null
  exclude_bots: boolean
  exclude_admins: boolean
  last_seen: string
}

export interface AudienceItem {
  id: number
  tg_user_id: number | null
  username: string | null
  /** Bitmask of what already happened to this entry. */
  flags: number
  cycles: number
  created_at: string
}

export interface AudienceItemsPage {
  items: AudienceItem[]
  total: number
}

export interface AudienceImportResult {
  added: number
  skipped: number
  errors: string[]
  audience: Audience
}


// ── tasks ─────────────────────────────────────────────────────────────────────

export interface TaskProgress {
  done_today: number
  done_total: number
  failed_total: number
  last_tick_at: string | null
}

export interface TaskInput {
  name: string
  task_type: string
  account_ids: number[]
  main_account_id?: number | null
  audience_id?: number | null
  project_id?: number | null
  daily_limit?: number | null
  delay_from: number
  delay_to: number
  autostart_at?: string | null
  params: Record<string, unknown>
}

/** What a broadcast sends — shared by the DM and chat tools. */
export interface MessageContentInput {
  text?: string
  image_url?: string | null
  repost?: { chat: string; message_id: number } | null
  silent?: boolean
  hide_author?: boolean
}

export interface Task {
  id: number
  project_id: number | null
  audience_id: number | null
  audience_name: string | null
  name: string
  task_type: string
  status: string
  daily_limit: number | null
  delay_from: number
  delay_to: number
  autostart_at: string | null
  started_at: string | null
  finished_at: string | null
  params: Record<string, unknown>
  account_ids: number[]
  main_account_id: number | null
  progress: TaskProgress
  created_at: string
}

export interface TaskLog {
  id: number
  level: string
  message: string
  account_id: number | null
  created_at: string
}

export interface TaskLogsPage {
  items: TaskLog[]
  total: number
}

// ── live stream ───────────────────────────────────────────────────────────────

/** One message off the cabinet's socket. */
export interface LiveEvent {
  type: string
  data: Record<string, any>
  ts: string
}
