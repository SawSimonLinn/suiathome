'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { RecipeImageCard } from '@/components/recipe-image-card';
import type { Recipe } from '@/lib/types';

interface RecipesCarouselProps {
  recipes: Recipe[];
}

export function RecipesCarousel({ recipes }: RecipesCarouselProps) {
  return (
    <div className="px-12">
      <Carousel opts={{ align: 'start', loop: true }}>
        <CarouselContent>
          {recipes.map((recipe) => (
            <CarouselItem key={recipe.id} className="basis-full md:basis-1/2 lg:basis-1/3">
              <RecipeImageCard recipe={recipe} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <p className="md:hidden text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1" aria-hidden="true">
        <span>swipe for more</span>
        <span>→</span>
      </p>
    </div>
  );
}
