import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/recipe-card';
import { getLatestRecipes, getPopularRecipes, recipes } from '@/lib/data';
import { ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const latestRecipes = getLatestRecipes(4);
  const popularRecipes = getPopularRecipes(4);

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-main');

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[70vh] bg-secondary/50">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt="Hero image of a delicious meal"
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto h-full flex flex-col items-start justify-center text-white px-4 md:px-8">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold !leading-tight tracking-tight">
            Sui at home
          </h1>
          <p className="mt-4 max-w-lg text-lg md:text-xl text-gray-200">
            Discover delicious recipes made with love, right from our kitchen to yours.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/recipes">
              Explore Recipes <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center">Latest Recipes</h2>
          <p className="text-center text-muted-foreground mt-2 mb-8 md:mb-12">Fresh out of the kitchen</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {latestRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link href="/recipes">View All Recipes</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center">Popular Picks</h2>
          <p className="text-center text-muted-foreground mt-2 mb-8 md:mb-12">Fan favorites you won't want to miss</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {popularRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
