'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * Theme for the whole cabinet. Dark is the default — an operator watching task
 * logs for hours asked for it — but the choice is remembered and switchable
 * (see `ThemeToggle`). `attribute="class"` toggles the `.dark` class the shared
 * UI tokens key off; `enableSystem={false}` keeps "default dark" from being
 * overridden by the OS on first load.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
