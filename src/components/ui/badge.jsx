import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-white',
        secondary: 'border-transparent bg-secondary text-white',
        destructive: 'border-transparent bg-destructive/15 text-destructive border-destructive/20',
        outline: 'text-foreground',
        income: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        expense: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
        scheduled: 'border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
        in_progress: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
        completed: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        cancelled: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
