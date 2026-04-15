'use client';

import { useEffect, useState } from 'react';

import { LoadingProgress } from '@/components/layout/loading-progress';
import { cn } from '@/lib/utils';

const TRANSITION_BAR_MS = 450;

export default function Template({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showProgress, setShowProgress] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowProgress(false);
    }, TRANSITION_BAR_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative min-h-full">
      {showProgress ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
          <LoadingProgress />
        </div>
      ) : null}
      <div
        className={cn(
          'transition-opacity duration-200',
          showProgress ? 'opacity-95' : 'opacity-100'
        )}
      >
        {children}
      </div>
    </div>
  );
}
