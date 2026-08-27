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
  /** Сколько НОВЫХ записей может принести один заход. */
  max_collect_per_run: number
  /** Сколько людей заход имеет право просмотреть (уже собранные — тоже). */
  max_scan_per_run: number
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
  error_code_labels: Record<string, string>
  log_levels: MetaOption[]
  account_limit_keys: string[]
  default_account_limits: Record<string, number>
  proxy_soft_account_cap: number
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
  /** today's effective caps with the warm-up ramp folded in */
  limits_today: Record<string, number>
  warmup: {
    active: boolean
    skipped: boolean
    fraction: number
    day: number
    ramp_days: number
  }
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
  /** Required: a session only opens with the app it was created under. */
  api_id: number
  api_hash: string
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
  /** run at full caps from day one (aged / already-warmed session) */
  skip_warmup?: boolean
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

/** One group a base collects from — each with its own mode. */
export interface AudienceSource {
  type: string
  target: string
}

export interface Audience {
  id: number
  project_id: number | null
  name: string
  kind: string
  items_count: number
  note: string | null
  /** Groups this base collects from (union, deduped). */
  sources: AudienceSource[]
  /** State of the collection that filled (or is filling) this base. */
  collect: CollectProgress | null
  created_at: string
}

export interface AudienceInput {
  name: string
  kind: string
  project_id?: number | null
  note?: string | null
  /** replace the source list (add/remove groups after creation); sent as {target, mode} */
  sources?: AudienceSourceInput[]
}

/** A source as the collect form sends it: target + mode. */
export interface AudienceSourceInput {
  target: string
  mode: string
}

export interface AudienceCollectInput {
  name: string
  sources: AudienceSourceInput[]
  account_id: number
  project_id?: number | null
  limit: number
  messages_limit?: number | null
  since_days?: number | null
  exclude_bots: boolean
  exclude_admins: boolean
  last_seen: string
}

export interface AudienceRecollectInput {
  account_id: number
  limit?: number | null
}

export interface AudienceItem {
  id: number
  tg_user_id: number | null
  username: string | null
  /** Accounts holding an access hash for this entry — see `AudienceReach`. */
  hash_accounts: number[]
  /** Collected from a message, so any account seeing that chat can reach them. */
  has_message_ref: boolean
  /** Bitmask of what already happened to this entry. */
  flags: number
  cycles: number
  created_at: string
}

export interface AudienceItemsPage {
  items: AudienceItem[]
  total: number
}

/** Who can actually work with a base: Telegram issues the access hash per
 *  account, so a bare id is addressable only by the account that saw it. */
export interface AudienceReach {
  total: number
  with_username: number
  with_message: number
  unreachable: number
  accounts: { account_id: number; label: string; items: number }[]
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
  /** Today's *enforced* ceiling — can be lower than the `daily_limit` the
   *  operator set, because the target group's size caps inviting too. */
  daily_cap: number | null
  daily_cap_source: DailyCapSource | null
  /** Members of the target group, when its cap is the binding one. */
  group_members: number | null
}

/** Which limit produced `daily_cap` — mirrors
 *  `backend/apps/tglab/constants.py:DAILY_CAP_SOURCES`. */
export type DailyCapSource = 'task' | 'group'

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

// ── mass import ─────────────────────────────────────────────────────────────────

/** One line of a batch import — imported, or failed with the reason. */
export interface AccountImportItemResult {
  index: number
  label: string
  status: 'imported' | 'failed'
  account_id: number | null
  error: string | null
}

export interface AccountBulkImportResult {
  imported: number
  failed: number
  results: AccountImportItemResult[]
}

// ── statistics (stage 5) ────────────────────────────────────────────────────────

/** One day of the activity series — a limit day (Bishkek). */
export interface DayPoint {
  date: string
  ok: number
  failed: number
  skipped: number
}

/** Outcome split of one action kind over a window. */
export interface TypeBreakdown {
  type: string
  ok: number
  failed: number
  skipped: number
}

export interface ErrorCount {
  code: string
  count: number
}

export interface AccountBreakdown {
  account_id: number
  label: string
  ok: number
  failed: number
  skipped: number
}

/** GET /tglab/stats/overview — the dashboard's numbers. */
export interface StatsOverview {
  accounts_total: number
  accounts_by_status: Record<string, number>
  accounts_frozen: number
  tasks_total: number
  tasks_running: number
  today: TypeBreakdown[]
  series: DayPoint[]
}

/** GET /tglab/stats/tasks/:id — per-task breakdown behind the log. */
export interface TaskStats {
  task_id: number
  ok: number
  failed: number
  skipped: number
  top_errors: ErrorCount[]
  by_account: AccountBreakdown[]
  series: DayPoint[]
  last_action_at: string | null
}
