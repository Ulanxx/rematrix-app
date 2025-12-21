import type React from 'react'

import { cn } from '@/lib/utils'

type Props = {
  className?: string
  children: React.ReactNode
}

export function BackgroundGradient({ className, children }: Props) {
  return (
    <div
      className={cn(
        'relative rounded-xl bg-white',
        'before:absolute before:inset-[-2px] before:-z-10 before:rounded-[inherit] before:bg-[conic-gradient(from_180deg_at_50%_50%,#3b82f6_0deg,#a855f7_120deg,#22c55e_240deg,#3b82f6_360deg)] before:opacity-70',
        'after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-white',
        className,
      )}
    >
      {children}
    </div>
  )
}
