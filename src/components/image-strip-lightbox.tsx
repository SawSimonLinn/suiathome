'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type LightboxImage = {
  alt: string;
  src: string;
};

type ImageStripLightboxProps = {
  dialogDescription?: string;
  dialogTitle: string;
  images: LightboxImage[];
  itemClassName?: string;
};

export function ImageStripLightbox({
  dialogDescription,
  dialogTitle,
  images,
  itemClassName,
}: ImageStripLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedImage =
    selectedIndex === null ? null : images[selectedIndex] ?? null;

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            className={cn(
              'group relative w-[min(80vw,22rem)] shrink-0 snap-start overflow-hidden border-2 border-foreground bg-secondary/10 paper-shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              itemClassName
            )}
            onClick={() => setSelectedIndex(index)}
            aria-label={`View ${image.alt}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
            />
            <span className="absolute bottom-3 right-3 border-2 border-foreground bg-paper px-2 py-1 text-xs font-semibold uppercase tracking-wide opacity-0 transition-opacity group-hover:opacity-100">
              View Full Image
            </span>
          </button>
        ))}
      </div>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedIndex(null);
          }
        }}
      >
        <DialogContent className="w-[min(94vw,1100px)] max-w-[1100px] bg-background p-3 sm:p-4">
          <DialogTitle className="sr-only">{dialogTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {dialogDescription || `Large preview for ${dialogTitle}.`}
          </DialogDescription>
          <div className="flex justify-center overflow-hidden border-2 border-foreground bg-secondary/20">
            {selectedImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="block h-auto max-h-[80vh] w-auto max-w-full object-contain"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
