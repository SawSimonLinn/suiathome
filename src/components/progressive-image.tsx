"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Warm cream fallback blurDataURL for non-Supabase images
const WARM_BLUR_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoH" +
  "BwYIDAoMCwsKCwsNCxAQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkU" +
  "DQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAB" +
  "AAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAU" +
  "AQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=";

function getSupabaseTransformUrl(
  src: string,
  width: number,
  quality: number,
): string {
  // Supabase storage transform API: append /render/image/public/ path with params
  // URLs look like: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const url = new URL(src);
  url.searchParams.set("width", String(width));
  url.searchParams.set("quality", String(quality));
  return url.toString();
}

function isSupabaseStorageUrl(src: unknown): src is string {
  return (
    typeof src === "string" &&
    src.includes(".supabase.co/storage/")
  );
}

type ProgressiveImageProps = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
  shimmerClassName?: string;
};

export function ProgressiveImage({
  className,
  shimmerClassName,
  ...props
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  const isSupabase = isSupabaseStorageUrl(props.src);
  const lqipUrl = isSupabase
    ? getSupabaseTransformUrl(props.src as string, 20, 10)
    : null;

  // For Supabase images, serve at 800px max — still passes through Next.js srcset
  const optimizedSrc = isSupabase
    ? getSupabaseTransformUrl(props.src as string, 800, 80)
    : props.src;

  // Priority images (above-the-fold) load eagerly; everything else is lazy
  const fetchPriority = props.priority ? "high" : "low";

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <>
          {lqipUrl ? (
            /* Real blurred thumbnail — actual image content, instantly visible */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lqipUrl}
              alt=""
              aria-hidden="true"
              loading={props.priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={fetchPriority}
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg"
            />
          ) : (
            /* Fallback shimmer for non-Supabase images */
            <div
              className={cn(
                "absolute inset-0 overflow-hidden animate-pulse",
                shimmerClassName ?? "bg-[var(--blush-light,#f5e6e8)]",
              )}
              aria-hidden="true"
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          )}
        </>
      )}

      <Image
        {...props}
        src={optimizedSrc}
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
