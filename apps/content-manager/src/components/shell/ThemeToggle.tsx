'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@doska/ui'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Тема оформления">
          <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Светлая</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Тёмная</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>Как в системе</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
