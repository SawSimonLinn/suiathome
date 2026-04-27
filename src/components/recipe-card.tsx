"use client";

import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useRecipeInteractions } from "@/hooks/use-recipe-interactions";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Heart, Share2, Eye } from "lucide-react";
import { ProgressiveImage } from "./progressive-image";

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
  priority?: boolean;
}

const CUTE_STICKERS = ['🌸', '🍓', '🌷', '✨', '🧁', '🌼', '🍰', '🌺', '🫶', '🌿'];
const TAPE_COLORS = ['var(--brass)', 'var(--blush)', 'var(--sage)', 'var(--lavender)'];
const TAPE_ROTATIONS = ['-2deg', '2deg', '-1.5deg', '1.5deg', '-3deg', '3deg'];

function getDoodleProps(id: string) {
  const code = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    sticker: CUTE_STICKERS[code % CUTE_STICKERS.length],
    tapeColor: TAPE_COLORS[code % TAPE_COLORS.length],
    tapeRotation: TAPE_ROTATIONS[code % TAPE_ROTATIONS.length],
    stickerRotation: (code % 2 === 0 ? 1 : -1) * (8 + (code % 6)),
  };
}

export function RecipeCard({ recipe, className, priority }: RecipeCardProps) {
  const {
    isLiked,
    likeCount,
    isSharing,
    pendingAction,
    toggleLike,
    shareRecipe,
  } = useRecipeInteractions({
    recipeId: recipe.id,
    recipePathId: recipe.id,
    recipeTitle: recipe.title,
    initialLikeCount: recipe.likes,
    initialFavoriteCount: recipe.favorites,
    initialLiked: recipe.isLiked ?? false,
    initialFavorited: recipe.isFavorited ?? false,
  });

  const coverImage = recipe.imageUrl
    ? {
        imageUrl: recipe.imageUrl,
        imageHint: recipe.imageHint || "recipe photo",
      }
    : PlaceHolderImages.find((p) => p.id === recipe.imageId);

  const stopLinkNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const { sticker, tapeColor, tapeRotation, stickerRotation } = getDoodleProps(recipe.id);

  return (
    <Link href={`/recipes/${recipe.id}`} className="group block h-full">
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden border-2 border-foreground bg-paper paper-shadow transition-all duration-300 group-hover:paper-shadow-lg group-hover:-translate-y-1",
          className
        )}
      >
        {/* Tape strip at top */}
        <div className="relative h-0">
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 border border-foreground/60 z-10"
            style={{ backgroundColor: tapeColor, opacity: 0.65, rotate: tapeRotation }}
            aria-hidden="true"
          />
        </div>

        {/* Image */}
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          {coverImage ? (
            <ProgressiveImage
              src={coverImage.imageUrl}
              alt={recipe.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ objectPosition: recipe.coverPosition ?? 'center center' }}
              data-ai-hint={coverImage.imageHint}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}
          {/* Category badge overlaid on image */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-0 shadow-sm text-xs font-medium px-2.5 py-1">
              {recipe.category.name}
            </Badge>
          </div>
          {/* Cute sticker emoji */}
          <span
            className="absolute bottom-2 right-2 text-2xl select-none pointer-events-none drop-shadow-sm"
            style={{ rotate: `${stickerRotation}deg` }}
            aria-hidden="true"
          >
            {sticker}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 gap-2">
          <h3
            className="font-headline text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors"
            title={recipe.title}
          >
            {recipe.title}
          </h3>
          <p className="text-xs text-muted-foreground">By {recipe.author.name}</p>

          {/* Squiggly divider */}
          <div className="mt-auto pt-3">
            <svg width="100%" height="10" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true" className="mb-3">
              <path d="M0 5 Q10 1 20 5 Q30 9 40 5 Q50 1 60 5 Q70 9 80 5 Q90 1 100 5 Q110 9 120 5 Q130 1 140 5 Q150 9 160 5 Q170 1 180 5 Q190 9 200 5" stroke="var(--sage-dark, #4a7a40)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.35"/>
            </svg>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                {recipe.views} {recipe.views === 1 ? "view" : "views"}
              </span>

              <div className="flex items-center gap-1">
                {/* Like */}
                <button
                  type="button"
                  onClick={(e) => {
                    stopLinkNavigation(e);
                    void toggleLike();
                  }}
                  disabled={pendingAction === "like"}
                  aria-label="Like recipe"
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
                    isLiked
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-all",
                      isLiked && "fill-current scale-110"
                    )}
                  />
                  <span>{likeCount}</span>
                </button>

                {/* Share */}
                <button
                  type="button"
                  onClick={(e) => {
                    stopLinkNavigation(e);
                    void shareRecipe();
                  }}
                  disabled={isSharing}
                  aria-label="Share recipe"
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
                >
                  <Share2 className={cn("h-4 w-4", isSharing && "animate-pulse")} />
                  <span>{isSharing ? "..." : "Share"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
