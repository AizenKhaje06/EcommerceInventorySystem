'use client'

import { cn } from '@/lib/utils'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

function SkeletonCell({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse',
        className
      )}
      aria-hidden="true"
    />
  )
}

/**
 * Drop-in skeleton loader for data tables.
 * Shows animated placeholder rows while data is loading.
 */
export function TableSkeleton({ rows = 8, columns = 5, className }: TableSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading table data"
      className={cn('w-full space-y-0', className)}
    >
      {/* Header row */}
      <div className="flex items-center gap-4 px-4 py-3 bg-black dark:bg-black border-b border-slate-200 dark:border-slate-800">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonCell
            key={i}
            className={cn(
              'h-3 bg-slate-600',
              i === 0 && 'w-32',
              i === 1 && 'w-24',
              i === 2 && 'w-20',
              i >= 3 && 'flex-1'
            )}
          />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <SkeletonCell
              key={colIdx}
              className={cn(
                colIdx === 0 && 'w-32',
                colIdx === 1 && 'w-24',
                colIdx === 2 && 'w-20 rounded-full',
                colIdx >= 3 && 'flex-1',
                // Vary widths for realistic look
                rowIdx % 3 === 0 && colIdx >= 3 && 'w-3/4',
                rowIdx % 3 === 1 && colIdx >= 3 && 'w-full',
                rowIdx % 3 === 2 && colIdx >= 3 && 'w-5/6'
              )}
            />
          ))}
        </div>
      ))}

      <span className="sr-only">Loading, please wait...</span>
    </div>
  )
}

/**
 * Skeleton for KPI stat cards (used in dashboard).
 */
export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading statistics"
      className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 border-0 shadow-lg rounded-xl bg-white dark:bg-slate-900 animate-pulse"
          aria-hidden="true"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading statistics...</span>
    </div>
  )
}

/**
 * Skeleton for a single card with title + content area.
 */
export function CardSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse"
    >
      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" aria-hidden="true" />
      <div className="space-y-2.5" aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn('h-3 bg-slate-200 dark:bg-slate-700 rounded', i % 2 === 0 ? 'w-full' : 'w-4/5')}
          />
        ))}
      </div>
      <span className="sr-only">Loading content...</span>
    </div>
  )
}
