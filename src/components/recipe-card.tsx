"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Recipe } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { Heart, Bookmark } from "lucide-react";
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
          "relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card",
          className
        )}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
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
          <Badge variant="secondary" className="absolute top-3 left-3 bg-secondary/80 backdrop-blur-sm">
            {recipe.category.name}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-headline text-xl font-semibold truncate" title={recipe.title}>
            {recipe.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            By {recipe.author.name}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors"
              aria-label="Like recipe"
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )}
              />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={(e) => {e.preventDefault(); e.stopPropagation()}} aria-label="Save recipe">
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
