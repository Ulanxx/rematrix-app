import type React from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AppShell(props: {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const location = useLocation()
  const pathname = location.pathname

  const nav = [
    { label: '首页', to: '/' },
    { label: '创建课程', to: '/course/create' },
    { label: 'PromptOps', to: '/promptops' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold tracking-tight text-white/90 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]">
              Rematrix
            </div>
            <nav className="hidden items-center gap-2 md:flex">
              {nav.map((item) => {
                const active = pathname === item.to
                return (
                  <Button
                    key={item.to}
                    asChild
                    variant={active ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'border-white/20 bg-white/5 text-white/90 transition-all hover:bg-white/10 hover:text-white',
                      active && 'bg-white/10 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]',
                    )}
                  >
                    <Link to={item.to}>{item.label}</Link>
                  </Button>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">{props.actions}</div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {(props.title || props.subtitle) && (
          <div className="mb-6">
            {props.title && (
              <h1 className="text-2xl font-semibold tracking-tight text-white/90 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                {props.title}
              </h1>
            )}
            {props.subtitle && (
              <p className="mt-1 text-sm text-white/60">{props.subtitle}</p>
            )}
          </div>
        )}

        {props.children}
      </main>
    </div>
  )
}
