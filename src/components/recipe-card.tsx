"use client";

import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useRecipeInteractions } from "@/hooks/use-recipe-interactions";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "./ui/badge";

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

export function RecipeCard({ recipe, className }: RecipeCardProps) {
  const {
    isLiked,
    isSaved,
    isFavorited,
    likeCount,
    favoriteCount,
    pendingAction,
    toggleLike,
    toggleSave,
    toggleFavorite,
  } = useRecipeInteractions({
    recipeId: recipe.id,
    initialLikeCount: recipe.likes,
    initialFavoriteCount: recipe.favorites,
    initialLiked: recipe.isLiked ?? false,
    initialSaved: recipe.isSaved ?? false,
    initialFavorited: recipe.isFavorited ?? false,
  });

  const coverImage = recipe.imageUrl
    ? {
        imageUrl: recipe.imageUrl,
        imageHint: recipe.imageHint || 'recipe photo',
      }
    : PlaceHolderImages.find((p) => p.id === recipe.imageId);

  const stopLinkNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
           <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <Button
              type="button"
              size="sm"
              variant={isLiked ? "secondary" : "ghost"}
              onClick={(event) => {
                stopLinkNavigation(event);
                void toggleLike();
              }}
              disabled={pendingAction === "like"}
              aria-label="Like recipe"
            >
              Like ({likeCount})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={isSaved ? "secondary" : "ghost"}
              onClick={(event) => {
                stopLinkNavigation(event);
                void toggleSave();
              }}
              disabled={pendingAction === "save"}
              aria-label="Save recipe"
            >
              {isSaved ? "Saved" : "Save"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={isFavorited ? "secondary" : "ghost"}
              onClick={(event) => {
                stopLinkNavigation(event);
                void toggleFavorite();
              }}
              disabled={pendingAction === "favorite"}
              aria-label="Favorite recipe"
            >
              Favorite ({favoriteCount})
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
