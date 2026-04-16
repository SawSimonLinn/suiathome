'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RecipeTipsPanelProps = {
  tips: string[];
  className?: string;
  collapsedCharacterCount?: number;
};

function buildTipsBody(tips: string[]) {
  return tips
    .map((tip) => tip.trim())
    .filter(Boolean)
    .join(' ');
}

export function RecipeTipsPanel({
  tips,
  className,
  collapsedCharacterCount = 280,
}: RecipeTipsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tipsBody = buildTipsBody(tips);

  if (!tipsBody) {
    return null;
  }

  const shouldCollapse = tipsBody.length > collapsedCharacterCount;
  const visibleText =
    shouldCollapse && !isExpanded
      ? `${tipsBody.slice(0, collapsedCharacterCount).trimEnd()}...`
      : tipsBody;

  return (
    <div
      className={cn(
        'border-2 border-foreground bg-secondary/40 p-4 paper-shadow-sm sm:p-5',
        className
      )}
    >
      <p className="leading-relaxed text-foreground/90">{visibleText}</p>
      {shouldCollapse ? (
        <Button
          type="button"
          variant="link"
          className="mt-3 h-auto p-0 text-sm font-semibold normal-case tracking-normal"
          onClick={() => setIsExpanded((value) => !value)}
        >
          {isExpanded ? 'See less' : 'See more'}
        </Button>
      ) : null}
    </div>
  );
}
