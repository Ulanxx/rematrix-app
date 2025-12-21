import * as React from 'react'

import { cn } from '@/lib/utils'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50 ring-offset-background',
      size === 'sm' && 'h-8 px-3',
      size === 'md' && 'h-9 px-4 py-2',
      size === 'lg' && 'h-10 px-6',
      variant === 'default' && 'bg-slate-900 text-white hover:bg-slate-800',
      variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      variant === 'outline' &&
        'border border-slate-200 bg-white hover:bg-slate-50 text-slate-900',
      variant === 'ghost' && 'hover:bg-slate-100 text-slate-900',
      variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700',
      className,
    )

    if (asChild) {
      const child = React.Children.only(children)
      if (!React.isValidElement(child)) return null

      const childProps = child.props as { className?: unknown }
      const childClassName =
        typeof childProps.className === 'string' ? childProps.className : undefined

      return React.cloneElement(child, {
        className: cn(childClassName, classes),
      })
    }

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
