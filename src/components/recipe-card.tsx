"use client";

import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useRecipeInteractions } from "@/hooks/use-recipe-interactions";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Heart, Share2, Eye } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

export function RecipeCard({ recipe, className }: RecipeCardProps) {
  const {
    isLiked,
    likeCount,
    isSharing,
    pendingAction,
    toggleLike,
    shareRecipe,
  } = useRecipeInteractions({
    recipeId: recipe.id,
    recipeSlug: recipe.slug,
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

  return (
    <Link href={`/recipes/${recipe.slug}`} className="group block h-full">
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1",
          className
        )}
      >
        {/* Image */}
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
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

          {/* Footer: views + actions */}
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/60">
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
    </Link>
  );
}
