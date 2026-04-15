'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { RecipeCard } from '@/components/recipe-card';
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
            <CarouselItem key={recipe.id} className="md:basis-1/2 lg:basis-1/3">
              <RecipeCard recipe={recipe} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
