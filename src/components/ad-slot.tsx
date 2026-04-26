'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdSlotVariant = 'banner' | 'inline' | 'square' | 'leaderboard' | 'skyscraper';

interface AdSlotProps {
  variant?: AdSlotVariant;
  adSlot?: string;
  className?: string;
}

const AD_CLIENT = 'ca-pub-9272137381598865';

const variantStyle: Record<AdSlotVariant, React.CSSProperties> = {
  banner:      { display: 'block', width: '728px', height: '90px' },
  leaderboard: { display: 'block', width: '728px', height: '90px' },
  inline:      { display: 'block' },
  square:      { display: 'inline-block', width: '300px', height: '250px' },
  skyscraper:  { display: 'block', width: '120px', height: '600px' },
};

const variantFormat: Record<AdSlotVariant, string> = {
  banner:      'horizontal',
  leaderboard: 'horizontal',
  inline:      'auto',
  square:      'rectangle',
  skyscraper:  'vertical',
};

export function AdSlot({ variant = 'inline', adSlot, className }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!adSlot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not yet loaded
    }
  }, [adSlot]);

  if (!adSlot) return null;

  const isResponsive = variant === 'inline';

  return (
    <div className={cn('w-full flex justify-center', className)} aria-label="Advertisement">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={variantStyle[variant]}
        data-ad-client={AD_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format={variantFormat[variant]}
        {...(isResponsive ? { 'data-full-width-responsive': 'true' } : {})}
      />
    </div>
  );
}
