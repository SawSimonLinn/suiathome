'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdSlotVariant = 'banner' | 'inline' | 'leaderboard' | 'skyscraper';

interface AdSlotProps {
  variant?: AdSlotVariant;
  adSlot?: string;
  className?: string;
}

const AD_CLIENT = 'ca-pub-9272137381598865';

const variantStyle: Record<AdSlotVariant, React.CSSProperties> = {
  banner:      { display: 'block', width: '100%' },
  leaderboard: { display: 'block', width: '100%' },
  inline:      { display: 'block', width: '100%' },
  skyscraper:  { display: 'block', width: '100%' },
};

const variantFormat: Record<AdSlotVariant, string> = {
  banner:      'auto',
  leaderboard: 'auto',
  inline:      'auto',
  skyscraper:  'vertical',
};


export function AdSlot({ variant = 'inline', adSlot, className }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!adSlot || pushed.current) return;

    const el = insRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && !pushed.current) {
          pushed.current = true;
          observer.disconnect();
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch {
            // adsbygoogle not yet loaded
          }
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [adSlot]);

  if (!adSlot) return null;

  return (
    <div className={cn('w-full flex justify-center', className)} aria-label="Advertisement">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={variantStyle[variant]}
        data-ad-client={AD_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format={variantFormat[variant]}
        data-full-width-responsive="true"
      />
    </div>
  );
}
