import { getPublicRecipesData } from "@/lib/supabase/public-recipes";
import { RecipesClient } from "./RecipesClient";
import { AdSlot } from "@/components/ad-slot";

export default async function RecipesPage() {
  const { recipes, categories } = await getPublicRecipesData();

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

      {/* Top banner ad — below header */}
      <div className="mb-8">
        <AdSlot variant="leaderboard" adSlot="4817982526" />
      </div>

      <RecipesClient recipes={recipes} categories={categories} />

      {/* Bottom banner ad */}
      <div className="mt-12">
        <AdSlot variant="leaderboard" adSlot="4817982526" />
      </div>
    </div>
  );
}
