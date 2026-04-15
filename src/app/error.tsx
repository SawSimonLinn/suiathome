'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-headline text-8xl font-bold text-foreground/10 select-none">
        500
      </p>
      <h1 className="font-headline -mt-4 text-3xl md:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  );
}
