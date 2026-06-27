import { StatCardSkeleton, CardSkeleton } from '@/components/ui/table-skeleton'

export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto py-5 space-y-6" aria-live="polite" aria-busy="true">
      <div className="space-y-2">
        <div className="h-8 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
      <StatCardSkeleton count={4} />
      <StatCardSkeleton count={4} />
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-3">
        <CardSkeleton lines={6} />
        <CardSkeleton lines={6} />
        <CardSkeleton lines={6} />
      </div>
    </div>
  )
}
