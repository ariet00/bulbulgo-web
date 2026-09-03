import type { Platform } from '@doska/shared'

/**
 * Visual identity of each platform inside BulBul Social. Labels live next to
 * the `Platform` type in `@doska/shared` (`PLATFORM_LABELS`); this file only
 * holds what is specific to this app's UI.
 *
 * Monograms instead of trademarked logos: they read at 12px, need no brand
 * assets, and stay consistent across platforms that have no icon in lucide.
 */
export interface PlatformMark {
  /** Two-letter monogram rendered in the tile. */
  mono: string
  /** Tile background. */
  bg: string
  /** Tile text color. */
  fg: string
}

export const PLATFORM_MARKS: Record<Platform, PlatformMark> = {
  threads: { mono: 'Th', bg: '#1d1d1f', fg: '#ffffff' },
  instagram: { mono: 'Ig', bg: '#d6249f', fg: '#ffffff' },
  whatsapp: { mono: 'Wa', bg: '#25d366', fg: '#0b2b1a' },
  pages: { mono: 'Fb', bg: '#1877f2', fg: '#ffffff' },
  tiktok: { mono: 'Tt', bg: '#2b2b2f', fg: '#69f0e6' },
  telegram: { mono: 'Tg', bg: '#2aabee', fg: '#ffffff' },
}
