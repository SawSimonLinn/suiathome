import { getPublicRecipesPageData } from "@/lib/supabase/public-recipes";
import { RecipesClient } from "./RecipesClient";

export default async function RecipesPage() {
  const { recipes, categories, hasMore } = await getPublicRecipesPageData({});

  return (
    <div className="py-8 md:py-12">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="font-headline text-4xl md:text-5xl">
          All Recipes
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Browse through our collection of curated recipes. Find your next favorite meal here!
        </p>
      </header>

      <RecipesClient
        initialRecipes={recipes}
        categories={categories}
        initialHasMore={hasMore}
      />
    </div>
  );
}
