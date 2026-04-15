import { LoaderCircle } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

export default function RecipeLoading() {
  return (
    <div className="mx-auto max-w-4xl py-10" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Loading recipe
      </div>

      {/* Cover image */}
      <Skeleton className="mt-8 h-72 w-full md:h-96" />

      <div className="mt-8 grid gap-4">
        {/* Category badge */}
        <Skeleton className="h-5 w-20" />
        {/* Title */}
        <Skeleton className="h-10 w-3/4" />
        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Meta row */}
      <div className="mt-6 flex gap-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Ingredients */}
      <div className="mt-10 grid gap-3">
        <Skeleton className="h-6 w-36" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-1/2" />
        ))}
      </div>

      {/* Steps */}
      <div className="mt-10 grid gap-4">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid gap-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
