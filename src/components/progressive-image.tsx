"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Warm cream 1×1 JPEG used as blur placeholder while full image loads
const WARM_BLUR_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoH" +
  "BwYIDAoMCwsKCwsNCxAQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkU" +
  "DQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAB" +
  "AAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAU" +
  "AQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=";

type ProgressiveImageProps = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
  shimmerClassName?: string;
};

export function ProgressiveImage({
  className,
  shimmerClassName,
  ...props
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {/* Shimmer shown until image loads */}
      {!loaded && (
        <div
          className={cn(
            "absolute inset-0 animate-pulse",
            shimmerClassName ?? "bg-[var(--blush-light,#f5e6e8)]",
          )}
          aria-hidden="true"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      )}

      <Image
        {...props}
        placeholder="blur"
        blurDataURL={WARM_BLUR_URL}
        className={cn(
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
