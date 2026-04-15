import { cn } from '@/lib/utils';

type LoadingProgressProps = {
  className?: string;
};

export function LoadingProgress({ className }: LoadingProgressProps) {
  return (
    <div
      className={cn('h-1 w-full overflow-hidden bg-foreground/10', className)}
      aria-hidden="true"
    >
      <div className="sui-loading-bar h-full w-2/5 bg-foreground" />
    </div>
  );
}
