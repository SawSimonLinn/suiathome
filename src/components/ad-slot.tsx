import { cn } from '@/lib/utils';

type AdSlotVariant = 'banner' | 'inline' | 'square' | 'leaderboard' | 'skyscraper';

interface AdSlotProps {
  variant?: AdSlotVariant;
  className?: string;
  label?: string;
}

const variantConfig: Record<AdSlotVariant, { minH: string; maxW: string; aspect?: string }> = {
  banner:      { minH: 'min-h-[90px]',  maxW: 'max-w-full',    aspect: 'aspect-[728/90]' },
  inline:      { minH: 'min-h-[100px]', maxW: 'max-w-full' },
  square:      { minH: 'min-h-[250px]', maxW: 'max-w-[300px]', aspect: 'aspect-square' },
  leaderboard: { minH: 'min-h-[90px]',  maxW: 'max-w-[728px]', aspect: 'aspect-[728/90]' },
  skyscraper:  { minH: 'min-h-[600px]', maxW: 'max-w-[140px]' },
};

export function AdSlot({ variant = 'inline', className, label = 'Advertisement' }: AdSlotProps) {
  const cfg = variantConfig[variant];

  return (
    <div
      className={cn(
        'w-full mx-auto flex flex-col items-center justify-center gap-2',
        cfg.maxW,
        className,
      )}
      aria-label="Advertisement"
    >
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">
        {label}
      </span>
      <div
        className={cn(
          'w-full flex items-center justify-center',
          'border border-dashed border-foreground/15 rounded-sm',
          'bg-muted/30',
          cfg.minH,
          cfg.aspect,
        )}
      >
        <div className="flex flex-col items-center gap-1 text-muted-foreground/30 select-none pointer-events-none">
          <span className="text-2xl">📢</span>
          <span className="text-xs font-medium tracking-wide">Ad</span>
        </div>
      </div>
    </div>
  );
}
