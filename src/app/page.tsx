import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/recipe-card';
import { RecipesCarousel } from '@/components/recipes-carousel';
import { getHomepageRecipes } from '@/lib/supabase/public-recipes';
import { getTopTriedItPosts } from '@/lib/supabase/public-community';
import { TriedItCarousel } from '@/components/tried-it-carousel';

export default async function Home() {
  const [{ latestRecipes, popularRecipes }, triedItPosts] = await Promise.all([
    getHomepageRecipes(),
    getTopTriedItPosts(10),
  ]);

  return (
    <div className="flex flex-col py-8 md:py-12">
      <section className="w-full text-center py-12 md:py-24">
        <div className="mx-auto max-w-3xl border-2 border-foreground bg-paper p-6 sm:p-8 paper-shadow">
           <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl text-foreground">
            Sui at home
          </h1>
          <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground">
            From our kitchen to yours, discover recipes that are crafted with love, steeped in tradition, and waiting to be shared.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/recipes">
              Explore Recipes
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl">Newest Creations</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Discover the latest additions to our collection, fresh from the kitchen!</p>
        </div>
        {latestRecipes.length > 3 ? (
          <RecipesCarousel recipes={latestRecipes} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {latestRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Button asChild variant="outline">
            <Link href="/recipes">View All Recipes</Link>
          </Button>
        </div>
      </section>
      
      <section className="py-12 mt-8">
        <div className="text-center mb-12 px-4">
          <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl">Tried It!</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            See what our community is cooking — real attempts at our chef recipes, sorted by most loved.
          </p>
        </div>
        {triedItPosts.length > 3 ? (
          <TriedItCarousel posts={triedItPosts} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {triedItPosts.map((post) => (
              <div key={post.id} className="border-2 border-foreground bg-paper paper-shadow flex flex-col overflow-hidden">
                {post.imageUrl ? (
                  <div className="aspect-square overflow-hidden bg-secondary/20">
                    <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ) : (
                  <div className="aspect-square bg-secondary/20 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No photo</span>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm line-clamp-3">{post.caption}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Button asChild variant="outline">
            <Link href="/community">See All Community Posts</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
