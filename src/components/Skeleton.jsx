import { cn } from '../utils/cn'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('skeleton rounded-xl', className)}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}
