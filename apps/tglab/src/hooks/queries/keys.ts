/** Query keys of the cabinet — declared once so mutations can invalidate them. */
export const tglabKeys = {
  me: ['tglab', 'me'] as const,
  meta: ['tglab', 'meta'] as const,
  projects: ['tglab', 'projects'] as const,
}
