"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Recipe } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "./ui/badge";

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
      <Card className={cn("overflow-hidden transition-shadow duration-300 group-hover:shadow-lg", className)}>
        {coverImage ? (
           <Image
            src={coverImage.imageUrl}
            alt={recipe.title}
            width={400}
            height={300}
            className="w-full object-cover aspect-[4/3]"
            data-ai-hint={coverImage.imageHint}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center aspect-[4/3]">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        <CardContent className="p-4">
          <Badge variant="outline" className="mb-2">{recipe.category.name}</Badge>
           <h3 className="font-headline text-xl font-bold leading-tight" title={recipe.title}>
            {recipe.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            By {recipe.author.name}
          </p>
           <div className="mt-4 flex items-center gap-4 text-sm">
            <button
                onClick={handleLike}
                className={cn(
                    "font-medium hover:underline",
                    isLiked 
                        ? "text-primary-foreground font-bold" 
                        : "text-muted-foreground"
                )}
                aria-label="Like recipe"
            >
                Like ({likeCount})
            </button>
             <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* TODO: Add favorite logic */ }}
                className="font-medium text-muted-foreground hover:underline"
                aria-label="Favorite recipe"
            >
                Favorite
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
