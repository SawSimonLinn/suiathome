import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/recipe-card';
import { getLatestRecipes, getPopularRecipes } from '@/lib/data';

export default function Home() {
  const latestRecipes = getLatestRecipes(3);
  const popularRecipes = getPopularRecipes(4);

  return (
    <div className="flex flex-col py-8 md:py-12">
      <section className="w-full text-center border border-primary rounded-lg bg-secondary/30 p-8 md:p-12 mb-16 shadow-lg">
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
          <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary">
            Sui at home
          </h1>
        </div>
        <p className="mt-2 max-w-2xl mx-auto text-lg md:text-xl text-foreground/90 font-semibold">
          From our kitchen to yours, discover recipes that are crafted with love, steeped in tradition, and waiting to be shared.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/recipes">
            Explore Recipes
          </Link>
        </Button>
      </section>

      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">Newest Creations</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto font-semibold">Discover the latest additions to our collection, fresh from the kitchen!</p>
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
      </section>
      
      <section className="py-12 mt-8 rounded-lg bg-card border border-border">
         <div className="text-center mb-12 px-4">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">Community Favorites</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto font-semibold">These are the tried-and-true recipes that our community loves.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-8 pb-8">
          {popularRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>
    </div>
  );
}
