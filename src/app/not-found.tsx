import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <section className="relative flex min-h-[65vh] w-full items-center justify-center py-12 md:py-16">
      <div
        className="pointer-events-none absolute inset-0 hidden items-center justify-between px-2 sm:px-8 md:flex"
        aria-hidden="true"
      >
        <div className="flex flex-col gap-5 text-3xl opacity-35 sm:text-4xl">
          <span>🌸</span>
          <span>🌿</span>
          <span>🌷</span>
          <span>🪴</span>
        </div>
        <div className="flex flex-col gap-5 text-3xl opacity-35 sm:text-4xl">
          <span>🌺</span>
          <span>🌱</span>
          <span>💐</span>
          <span>🫙</span>
        </div>
      </div>

      <div
        className="relative z-10 w-full max-w-3xl overflow-hidden border-2 border-foreground paper-shadow"
        style={{ backgroundColor: 'var(--cream-warm)' }}
      >
        <div
          className="flex w-full items-center justify-center gap-2 border-b-2 border-foreground px-4 py-2"
          style={{ backgroundColor: 'var(--sage)' }}
        >
          <span
            className="text-sm font-medium uppercase tracking-widest"
            style={{ color: '#2d4a2a' }}
          >
            🌿 &nbsp; Lost in the kitchen? &nbsp; 🌿
          </span>
        </div>

        <div className="relative p-6 text-center sm:p-10">
          <div
            className="absolute left-6 top-4 h-5 w-14 rotate-[-3deg] border border-foreground opacity-70"
            style={{ backgroundColor: 'var(--brass)', opacity: 0.6 }}
          />
          <div
            className="absolute right-8 top-4 h-5 w-12 rotate-[2deg] border border-foreground opacity-70"
            style={{ backgroundColor: 'var(--blush)' }}
          />

          <div className="mb-4 flex justify-center gap-2" aria-hidden="true">
            {['🌸', '🌼', '🌸', '🌼', '🌸'].map((flower, i) => (
              <span key={i} className="text-xl">
                {flower}
              </span>
            ))}
          </div>

          <p
            className="font-headline text-6xl leading-none sm:text-7xl md:text-8xl"
            style={{ color: '#2d4a2a' }}
          >
            404
          </p>
          <h1
            className="mt-3 font-headline text-3xl leading-tight sm:text-4xl md:text-5xl"
            style={{ color: '#2d4a2a' }}
          >
            This page is off the menu
          </h1>
          <p
            className="mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: '#4a5e47' }}
          >
            The page you requested does not exist, moved, or was removed. Pick
            a path below and we&apos;ll get you back to something delicious.
          </p>

          <div
            className="mx-auto mb-7 mt-7 h-[3px] w-24 border-0"
            style={{ backgroundColor: 'var(--lavender)' }}
          />

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="border-2 border-foreground font-semibold"
            >
              <Link href="/">🏠 Go Home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold">
              <Link href="/recipes">🍽️ Browse Recipes</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold">
              <Link href="/community">💌 Community</Link>
            </Button>
          </div>
        </div>

        <div
          className="flex w-full justify-center gap-3 border-t-2 border-foreground py-2 text-lg"
          style={{ backgroundColor: 'var(--blush-light)' }}
          aria-hidden="true"
        >
          <span>🌷</span>
          <span>🌿</span>
          <span>🫶</span>
          <span>🌿</span>
          <span>🌷</span>
        </div>
      </div>
    </section>
  );
}
