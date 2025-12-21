import type React from 'react'

import { cn } from '@/lib/utils'

type Props = {
  className?: string
  children: React.ReactNode
}

export function GlassCard({ className, children }: Props) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-white/20 bg-white/10 backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/15',
        'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/5 before:to-white/0 before:p-[1px] before:-z-10',
        className,
      )}
    >
      {children}
    </div>
  )
}
