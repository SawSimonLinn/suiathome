"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Recipe } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

export function RecipeCard({ recipe, className }: RecipeCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(recipe.likes);

  const coverImage = PlaceHolderImages.find((p) => p.id === recipe.imageId);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <Link href={`/recipes/${recipe.slug}`} className="group block">
      <div
        className={cn(
          "overflow-hidden rounded-lg border-2 bg-card text-card-foreground transition-all duration-300 group-hover:border-primary group-hover:shadow-[8px_8px_0px_hsl(var(--primary))]",
          className
        )}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b-2">
          {coverImage ? (
             <Image
              src={coverImage.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={coverImage.imageHint}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          <Badge variant="secondary" className="absolute top-3 left-3 !font-body font-semibold">
            {recipe.category.name}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-headline text-2xl font-bold leading-tight truncate" title={recipe.title}>
            {recipe.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 font-semibold">
            By {recipe.author.name}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={handleLike}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isLiked ? "text-primary" : "text-muted-foreground"
              )}
              aria-label="Like recipe"
            >
              Like ({likeCount})
            </button>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={(e) => {e.preventDefault(); e.stopPropagation()}} aria-label="Favorite recipe">
                    Favorite
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={(e) => {e.preventDefault(); e.stopPropagation()}} aria-label="Save recipe">
                    Save
                </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
