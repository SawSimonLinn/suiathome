import { AdSlot } from './ad-slot';

interface SideRailAdLayoutProps {
  children: React.ReactNode;
}

export function SideRailAdLayout({ children }: SideRailAdLayoutProps) {
  return (
    <div className="xl:flex xl:gap-2 xl:items-start">
      {/* Left skyscraper — laptop and up */}
      <aside className="hidden xl:block shrink-0 w-[140px]" aria-hidden="true">
        <div className="sticky top-6">
          <AdSlot variant="skyscraper" adSlot="4762142206" />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>

      {/* Right skyscraper — laptop and up */}
      <aside className="hidden xl:block shrink-0 w-[140px]" aria-hidden="true">
        <div className="sticky top-6">
          <AdSlot variant="skyscraper" adSlot="4762142206" />
        </div>
      </aside>
    </div>
  );
}
