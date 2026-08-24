import {
  Contact,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Shield,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { TGLAB_PERMISSIONS } from '@/lib/constants'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Slug required to see the section (see `lib/constants.ts`). */
  permission: string
  /** Sections of later stages are listed but not clickable yet. */
  ready?: boolean
}

/** The cabinet's sections, in sidebar order. */
export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Дашборд',
    icon: LayoutDashboard,
    permission: TGLAB_PERMISSIONS.STATS_VIEW,
    ready: true,
  },
  {
    href: '/projects',
    label: 'Проекты',
    icon: FolderKanban,
    permission: TGLAB_PERMISSIONS.PROJECTS_VIEW,
    ready: true,
  },
  {
    href: '/accounts',
    label: 'Аккаунты',
    icon: Users,
    permission: TGLAB_PERMISSIONS.ACCOUNTS_VIEW,
    ready: true,
  },
  {
    href: '/proxies',
    label: 'Прокси',
    icon: Shield,
    permission: TGLAB_PERMISSIONS.PROXIES_VIEW,
    ready: true,
  },
  {
    href: '/audiences',
    label: 'Базы',
    icon: Contact,
    permission: TGLAB_PERMISSIONS.AUDIENCES_VIEW,
    ready: true,
  },
  {
    href: '/tasks',
    label: 'Задачи',
    icon: ListChecks,
    permission: TGLAB_PERMISSIONS.TASKS_VIEW,
    ready: true,
  },
]
