'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@doska/ui'

import { useProjects } from '@/hooks/queries'

/** Project picker used by every entity that can be filed under one.
 *  `NONE_VALUE` stands for «без проекта» — Radix forbids an empty item value. */
export const NONE_VALUE = 'none'

export function ProjectSelect({
  value,
  onChange,
  placeholder = 'Без проекта',
  className,
}: {
  value: number | null
  onChange: (value: number | null) => void
  placeholder?: string
  className?: string
}) {
  const { data: projects } = useProjects()

  return (
    <Select
      value={value ? String(value) : NONE_VALUE}
      onValueChange={(next) => onChange(next === NONE_VALUE ? null : Number(next))}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>{placeholder}</SelectItem>
        {projects?.map((project) => (
          <SelectItem key={project.id} value={String(project.id)}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
