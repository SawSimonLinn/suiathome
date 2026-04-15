"use client";

import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

interface RecipeImageCardProps {
  recipe: Recipe;
}

export function RecipeImageCard({ recipe }: RecipeImageCardProps) {
  const coverImage = recipe.imageUrl
    ? { imageUrl: recipe.imageUrl, imageHint: recipe.imageHint || "recipe photo" }
    : PlaceHolderImages.find((p) => p.id === recipe.imageId);

  return (
    <Link href={`/recipes/${recipe.slug}`} className="group block">
      <div className="overflow-hidden border-2 border-foreground paper-shadow transition-shadow hover:paper-shadow-lg">
        {/* Image — tall aspect ratio so it feels editorial */}
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
          {/* Text on top of image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <Badge variant="secondary" className="mb-2 text-xs">
              {recipe.category.name}
            </Badge>
            <h3 className="font-headline text-2xl leading-tight">
              {recipe.title}
            </h3>
            <p className="mt-1 text-sm text-white/70">By {recipe.author.name}</p>
            <p className="mt-1 text-xs text-white/50">
              {recipe.views} {recipe.views === 1 ? 'view' : 'views'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
