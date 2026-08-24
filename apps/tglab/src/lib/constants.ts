/**
 * Permission slugs of the cabinet — the mirror of
 * `backend/shared/permissions.py:TglabPerm`. Same value on both sides; keep
 * them in sync by hand (no cross-language inference).
 *
 * Used to hide what the signed-in role may not do — the backend still enforces.
 */
export const TGLAB_PERMISSIONS = {
  PROJECTS_VIEW: 'tglab.projects.view',
  PROJECTS_MANAGE: 'tglab.projects.manage',
  ACCOUNTS_VIEW: 'tglab.accounts.view',
  ACCOUNTS_MANAGE: 'tglab.accounts.manage',
  PROXIES_VIEW: 'tglab.proxies.view',
  PROXIES_MANAGE: 'tglab.proxies.manage',
  AUDIENCES_VIEW: 'tglab.audiences.view',
  AUDIENCES_MANAGE: 'tglab.audiences.manage',
  TASKS_VIEW: 'tglab.tasks.view',
  TASKS_MANAGE: 'tglab.tasks.manage',
  STATS_VIEW: 'tglab.stats.view',
} as const

export type TglabPermission = (typeof TGLAB_PERMISSIONS)[keyof typeof TGLAB_PERMISSIONS]

/** Colours offered for a project chip. */
export const PROJECT_COLORS = [
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#f97316',
  '#ef4444',
  '#14b8a6',
] as const
