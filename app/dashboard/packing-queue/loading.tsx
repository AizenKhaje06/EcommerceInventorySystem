import { TableSkeleton } from '@/components/ui/table-skeleton'

export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto py-5 space-y-4" aria-live="polite" aria-busy="true">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        ))}
      </div>
      <TableSkeleton rows={10} columns={9} />
    </div>
  )
}
