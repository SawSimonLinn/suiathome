'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

import { LoadingProgress } from '@/components/layout/loading-progress';
import { cn } from '@/lib/utils';

type NavigationFeedbackContextValue = {
  startNavigation: () => void;
};

const NavigationFeedbackContext =
  createContext<NavigationFeedbackContextValue | null>(null);

const MIN_VISIBLE_MS = 220;
const FAILSAFE_HIDE_MS = 12_000;

function isModifiedEvent(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function shouldTrackAnchorClick(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== '_self') {
    return false;
  }

  if (anchor.hasAttribute('download')) {
    return false;
  }

  const href = anchor.getAttribute('href');

  if (!href || href.startsWith('#')) {
    return false;
  }

  const currentUrl = new URL(window.location.href);
  const targetUrl = new URL(anchor.href, currentUrl);

  if (targetUrl.origin !== currentUrl.origin) {
    return false;
  }

  const onlyHashChanged =
    targetUrl.pathname === currentUrl.pathname &&
    targetUrl.search === currentUrl.search &&
    targetUrl.hash !== currentUrl.hash;

  if (onlyHashChanged) {
    return false;
  }

  return targetUrl.href !== currentUrl.href;
}

export function NavigationFeedbackProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationStartedAtRef = useRef(0);
  const hideTimeoutRef = useRef<number | null>(null);
  const failsafeTimeoutRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (failsafeTimeoutRef.current !== null) {
      window.clearTimeout(failsafeTimeoutRef.current);
      failsafeTimeoutRef.current = null;
    }
  }, []);

  const startNavigation = useCallback(() => {
    navigationStartedAtRef.current = Date.now();
    setIsNavigating(true);
    clearTimers();

    failsafeTimeoutRef.current = window.setTimeout(() => {
      setIsNavigating(false);
      failsafeTimeoutRef.current = null;
    }, FAILSAFE_HIDE_MS);
  }, [clearTimers]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || isModifiedEvent(event)) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (!shouldTrackAnchorClick(anchor)) {
        return;
      }

      startNavigation();
    };

    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [startNavigation]);

  useEffect(() => {
    if (!isNavigating) {
      return;
    }

    clearTimers();

    const elapsedMs = Date.now() - navigationStartedAtRef.current;
    const remainingMs = Math.max(0, MIN_VISIBLE_MS - elapsedMs);

    hideTimeoutRef.current = window.setTimeout(() => {
      setIsNavigating(false);
      hideTimeoutRef.current = null;
    }, remainingMs);

    return clearTimers;
  }, [clearTimers, isNavigating, pathname, searchKey]);

  useEffect(
    () => () => {
      clearTimers();
    },
    [clearTimers]
  );

  const contextValue = useMemo(
    () => ({
      startNavigation,
    }),
    [startNavigation]
  );

  return (
    <NavigationFeedbackContext.Provider value={contextValue}>
      {children}
      <div
        className={cn(
          'pointer-events-none fixed inset-0 z-[70] transition-opacity duration-150',
          isNavigating ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden={!isNavigating}
      >
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1.5px]" />
        <div className="absolute inset-x-0 top-0">
          <LoadingProgress className="h-1.5 bg-foreground/15" />
        </div>
        <div className="absolute left-1/2 top-24 -translate-x-1/2 border-2 border-foreground bg-paper px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-foreground paper-shadow sm:top-28">
          <span className="flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Opening page
          </span>
        </div>
      </div>
    </NavigationFeedbackContext.Provider>
  );
}

export function useNavigationFeedback() {
  const context = useContext(NavigationFeedbackContext);

  if (!context) {
    throw new Error(
      'useNavigationFeedback must be used within NavigationFeedbackProvider.'
    );
  }

  return context;
}
