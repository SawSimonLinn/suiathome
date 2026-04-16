"use client";

import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

interface RecipeImageCardProps {
  recipe: Recipe;
}

const CUTE_STICKERS = ['🌸', '🍓', '🌷', '✨', '🧁', '🌼', '🍰', '🌺', '🫶', '🌿'];
const TAPE_COLORS = ['var(--brass)', 'var(--blush)', 'var(--sage)', 'var(--lavender)'];

function getDoodleProps(id: string) {
  const code = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    sticker: CUTE_STICKERS[code % CUTE_STICKERS.length],
    tapeColor: TAPE_COLORS[(code + 2) % TAPE_COLORS.length],
    tapeRotation: (code % 2 === 0 ? 1 : -1) * (2 + (code % 3)),
    stickerRotation: (code % 2 === 0 ? 1 : -1) * (6 + (code % 8)),
  };
}

export function RecipeImageCard({ recipe }: RecipeImageCardProps) {
  const coverImage = recipe.imageUrl
    ? { imageUrl: recipe.imageUrl, imageHint: recipe.imageHint || "recipe photo" }
    : PlaceHolderImages.find((p) => p.id === recipe.imageId);

  const { sticker, tapeColor, tapeRotation, stickerRotation } = getDoodleProps(recipe.id);

  return (
    <Link href={`/recipes/${recipe.slug}`} className="group block">
      <div className="overflow-hidden border-2 border-foreground paper-shadow transition-all duration-300 hover:paper-shadow-lg hover:-translate-y-1 relative">

        {/* Tape strip */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 border border-foreground/60 z-10"
          style={{ backgroundColor: tapeColor, opacity: 0.65, rotate: `${tapeRotation}deg` }}
          aria-hidden="true"
        />

        {/* Image: tall aspect ratio so it feels editorial */}
        <div className="relative w-full aspect-[3/4]">
          {coverImage ? (
            <Image
              src={coverImage.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={coverImage.imageHint}
              sizes="420px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Cute sticker */}
          <span
            className="absolute top-3 right-3 text-2xl select-none pointer-events-none drop-shadow-sm z-10"
            style={{ rotate: `${stickerRotation}deg` }}
            aria-hidden="true"
          >
            {sticker}
          </span>

          {/* Text on top of image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <Badge variant="secondary" className="mb-2 text-xs">
              {recipe.category.name}
            </Badge>
            <h3 className="font-headline text-2xl leading-tight">
              {recipe.title}
            </h3>
            <p className="mt-1 text-sm text-white/70">By {recipe.author.name}</p>
            {/* Squiggly accent line */}
            <svg width="80" height="8" viewBox="0 0 80 8" fill="none" className="mt-2 opacity-60" aria-hidden="true">
              <path d="M2 4 Q10 1 18 4 Q26 7 34 4 Q42 1 50 4 Q58 7 66 4 Q72 2 78 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
            <p className="mt-1 text-xs text-white/50">
              {recipe.views} {recipe.views === 1 ? 'view' : 'views'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
