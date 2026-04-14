"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Recipe } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
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
          "relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-card shadow-sm transition-shadow duration-300 group-hover:shadow-lg",
          className
        )}
      >
        {coverImage ? (
           <Image
            src={coverImage.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={coverImage.imageHint}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}

        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Top-aligned content: Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary">{recipe.category.name}</Badge>
        </div>
        
        {/* Bottom-aligned content: Title, Author, and Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-headline text-lg font-bold leading-tight truncate text-white" title={recipe.title}>
            {recipe.title}
          </h3>
          <p className="text-sm text-white/90 mt-1">
            By {recipe.author.name}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
                onClick={handleLike}
                className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors backdrop-blur-sm",
                    isLiked 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-black/20 text-white hover:bg-black/40"
                )}
                aria-label="Like recipe"
            >
                Likes ({likeCount})
            </button>
             <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* TODO: Add favorite logic */ }}
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-colors"
                aria-label="Favorite recipe"
            >
                Favorite
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
