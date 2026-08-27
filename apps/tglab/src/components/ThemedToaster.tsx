'use client'

import { useTheme } from 'next-themes'
import { Toaster } from 'sonner'

/** Sonner doesn't read next-themes on its own — feed it the resolved theme so
 *  toasts match the cabinet instead of always rendering light. */
export function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      richColors
      position="top-center"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    />
  )
}
