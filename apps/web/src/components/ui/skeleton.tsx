function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-3 flex items-start justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-3 h-4 w-3/4" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function TemplateCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <Skeleton className="mb-4 aspect-square w-full rounded-lg" />
      <Skeleton className="mb-2 h-5 w-28" />
      <Skeleton className="mb-2 h-4 w-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-zinc-100 px-5 py-3.5 last:border-b-0 dark:border-zinc-800/50">
      <Skeleton className="h-4 w-48 shrink-0" />
      <div className="flex w-24 shrink-0 items-center gap-1.5">
        <Skeleton className="h-1.5 w-1.5 rounded-full" />
        <Skeleton className="h-3 w-14" />
      </div>
      <Skeleton className="hidden h-3.5 flex-1 lg:block" />
      <Skeleton className="h-3 w-8 shrink-0" />
      <Skeleton className="h-3 w-14 shrink-0" />
    </div>
  );
}

export { Skeleton };
