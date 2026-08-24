import type { AccountFilters } from '@/apis/accounts'
import type { ItemFilters } from '@/apis/audiences'

/** Query keys of the cabinet — declared once so mutations can invalidate them. */
export const tglabKeys = {
  me: ['tglab', 'me'] as const,
  meta: ['tglab', 'meta'] as const,
  projects: ['tglab', 'projects'] as const,
  proxies: ['tglab', 'proxies'] as const,
  accounts: ['tglab', 'accounts'] as const,
  accountsList: (filters: AccountFilters) => ['tglab', 'accounts', filters] as const,
  accountSessions: (id: number) => ['tglab', 'accounts', id, 'sessions'] as const,
  audiences: ['tglab', 'audiences'] as const,
  tasks: ['tglab', 'tasks'] as const,
  taskLogs: (id: number) => ['tglab', 'tasks', id, 'logs'] as const,
  audienceItems: (id: number, filters: ItemFilters) =>
    ['tglab', 'audiences', id, 'items', filters] as const,
}
