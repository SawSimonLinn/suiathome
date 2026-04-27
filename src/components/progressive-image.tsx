"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Warm cream 1×1 JPEG shown instantly while the real image loads
const WARM_BLUR_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoH" +
  "BwYIDAoMCwsKCwsNCxAQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkU" +
  "DQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAB" +
  "AAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAU" +
  "AQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=";

function isSupabaseStorageUrl(src: unknown): src is string {
  return (
    typeof src === "string" &&
    src.includes(".supabase.co/storage/v1/object/public/")
  );
}

// Supabase image transform API: /render/image/ path + width/quality params
// Drastically reduces egress vs serving full-size originals
function toSupabaseRenderUrl(src: string, width: number, quality: number): string {
  const renderSrc = src.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/",
  );
  const url = new URL(renderSrc);
  url.searchParams.set("width", String(width));
  url.searchParams.set("quality", String(quality));
  return url.toString();
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
  const [failed, setFailed] = useState(false);
  const [lqipError, setLqipError] = useState(false);

  const isSupabase = isSupabaseStorageUrl(props.src);

  // LQIP: tiny 20px version via Supabase transform (Pro plan feature — falls back to shimmer on free plan)
  const lqipUrl =
    isSupabase && !lqipError
      ? toSupabaseRenderUrl(props.src as string, 20, 10)
      : null;

  const showShimmer = !loaded && (lqipError || !isSupabase || failed);
  const showLqip = !loaded && !failed && lqipUrl;

  return (
    <div className="relative w-full h-full">
      {/* Blurred real-content LQIP */}
      {showLqip && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lqipUrl!}
          alt=""
          aria-hidden="true"
          loading={props.priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={props.priority ? "high" : "low"}
          onError={() => setLqipError(true)}
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg"
        />
      )}

      {/* Shimmer fallback: non-Supabase images, LQIP failure, or main image error */}
      {showShimmer && (
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

      {!failed && (
        <Image
          {...props}
          src={props.src}
          placeholder="blur"
          blurDataURL={WARM_BLUR_URL}
          className={cn(
            "transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            className,
          )}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(false);
          }}
        />
      )}
    </div>
  );
}
