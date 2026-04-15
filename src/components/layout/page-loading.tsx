import { LoaderCircle } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

export function PageLoading() {
  return (
    <div className="flex flex-col py-8 md:py-12" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Loading page
      </div>

      <div className="mt-8 grid gap-8">
        <section className="border-2 border-foreground bg-paper p-6 paper-shadow sm:p-8">
          <Skeleton className="h-10 w-40 sm:h-14 sm:w-60" />
          <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-4 w-5/6 max-w-xl" />
          <Skeleton className="mt-8 h-11 w-40" />
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-2 border-foreground bg-paper p-4 paper-shadow"
            >
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="mt-4 h-6 w-3/4" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="border-2 border-foreground bg-paper p-6 paper-shadow">
            <Skeleton className="h-8 w-40" />
            <div className="mt-6 grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="grid gap-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-4/5" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-2 border-foreground bg-paper p-6 paper-shadow">
            <Skeleton className="h-8 w-32" />
            <div className="mt-6 grid gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
