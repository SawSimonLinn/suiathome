import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/recipe-card';
import { getLatestRecipes, getPopularRecipes, recipes } from '@/lib/data';
import { ArrowRight, ChefHat } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const latestRecipes = getLatestRecipes(3);
  const popularRecipes = getPopularRecipes(4);

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-main');

  return (
    <div className="flex flex-col">
      <section className="w-full min-h-[80vh] grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col items-start justify-center p-8 md:p-16 order-2 md:order-1">
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold !leading-tight tracking-tight text-primary">
            Sui at home
          </h1>
          <p className="mt-6 max-w-md text-lg md:text-xl text-foreground/80">
            From our kitchen to yours, discover recipes that are crafted with love, steeped in tradition, and waiting to be shared.
          </p>
          <Button asChild size="lg" className="mt-10">
            <Link href="/recipes">
              Explore Recipes <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
        <div className="relative min-h-[40vh] md:min-h-full order-1 md:order-2">
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
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent md:bg-gradient-to-l"></div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-headline text-4xl md:text-5xl font-bold">Newest Creations</h2>
            <p className="text-center text-muted-foreground mt-3 max-w-2xl mx-auto">Discover the latest additions to our collection, fresh from the kitchen and ready to inspire your next culinary adventure.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 md:px-8">
           <div className="text-center mb-12">
            <h2 className="font-headline text-4xl md:text-5xl font-bold">Community Favorites</h2>
            <p className="text-center text-muted-foreground mt-3 max-w-2xl mx-auto">These are the tried-and-true recipes that our community comes back to again and again. See what's cooking in kitchens everywhere.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
