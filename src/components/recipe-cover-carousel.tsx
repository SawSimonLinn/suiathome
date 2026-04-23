'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type CarouselImage = {
  src: string;
  alt: string;
  objectPosition?: string;
};

type RecipeCoverCarouselProps = {
  images: CarouselImage[];
  compact?: boolean;
};

export function RecipeCoverCarousel({ images, compact }: RecipeCoverCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const total = images.length;
  const active = images[activeIndex];

  function prev() {
    setActiveIndex((i) => (i - 1 + total) % total);
  }

  function next() {
    setActiveIndex((i) => (i + 1) % total);
  }

  function modalPrev() {
    setModalIndex((i) => (i === null ? 0 : (i - 1 + total) % total));
  }

  function modalNext() {
    setModalIndex((i) => (i === null ? 0 : (i + 1) % total));
  }

  // Scroll active thumbnail into view
  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const thumb = container.children[activeIndex] as HTMLElement | undefined;
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeIndex]);

  // Keyboard navigation for modal
  useEffect(() => {
    if (modalIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setModalIndex(null);
      if (e.key === 'ArrowRight') setModalIndex((i) => i === null ? 0 : (i + 1) % total);
      if (e.key === 'ArrowLeft') setModalIndex((i) => i === null ? 0 : (i - 1 + total) % total);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalIndex, total]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Main image + arrows */}
      <div className="relative mb-0 w-full border-2 border-foreground border-b-0 paper-shadow-sm overflow-hidden">
        <div
          className={cn('relative w-full cursor-pointer', compact ? 'aspect-[4/3]' : 'aspect-video')}
          onClick={() => setModalIndex(activeIndex)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.src}
            alt={active.alt}
            className="w-full h-full object-cover"
            style={{ objectPosition: active.objectPosition ?? 'center center' }}
          />
          <span className="absolute top-3 right-3 text-3xl select-none pointer-events-none drop-shadow-md rotate-[8deg]" aria-hidden="true">🍜</span>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-5 border border-foreground/60 rotate-[-1deg]" style={{ backgroundColor: 'var(--brass)', opacity: 0.65 }} aria-hidden="true" />
        </div>

        {/* Carousel arrows — inside image area, stop propagation so they don't open modal */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-[calc(50%-20px)] -translate-y-1/2 flex items-center justify-center w-8 h-8 border-2 border-foreground bg-paper paper-btn z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-[calc(50%-20px)] -translate-y-1/2 flex items-center justify-center w-8 h-8 border-2 border-foreground bg-paper paper-btn z-10"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip — outside overflow-hidden wrapper so clicks always register */}
      {total > 1 && (
        <div
          ref={thumbsRef}
          className="flex gap-2 overflow-x-auto px-3 py-2 border-2 border-foreground border-t-0 snap-x"
          style={{ backgroundColor: 'var(--cream-warm)' }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'shrink-0 snap-start w-16 h-16 border-2 overflow-hidden transition-all',
                i === activeIndex
                  ? 'border-foreground ring-2 ring-foreground ring-offset-1'
                  : 'border-foreground/30 opacity-60 hover:opacity-100'
              )}
              aria-label={`Photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80"
          onClick={(e) => { if (e.target === e.currentTarget) setModalIndex(null); }}
        >
          <div className="relative border-2 border-foreground bg-paper paper-shadow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[modalIndex].src}
              alt={images[modalIndex].alt}
              className="block max-w-[90vw] max-h-[82vh] w-auto h-auto object-contain"
            />

            {/* Close */}
            <button
              type="button"
              onClick={() => setModalIndex(null)}
              className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 border-2 border-foreground bg-paper paper-btn"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal arrows */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={modalPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 border-2 border-foreground bg-paper paper-btn"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={modalNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 border-2 border-foreground bg-paper paper-btn"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 border-2 border-foreground bg-paper px-2 py-0.5 text-xs font-semibold">
              {modalIndex + 1} / {total}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
