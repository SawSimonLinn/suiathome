import { notFound } from 'next/navigation';
import { getPublicRecipeBySlug, getRelatedPublicRecipes } from '@/lib/supabase/public-recipes';
import { getPublicCommunityPostsByRecipeId } from '@/lib/supabase/public-community';
import RecipeClientPage from './RecipeClientPage';

export default async function RecipeDetailPage({ params }: { params: { slug:string } }) {
  const recipe = await getPublicRecipeBySlug(params.slug);

  if (!recipe) {
    notFound();
  }
  
  const [relatedRecipes, relatedPosts] = await Promise.all([
    getRelatedPublicRecipes(recipe, 3),
    getPublicCommunityPostsByRecipeId(recipe.id, 4),
  ]);

  return (
    <RecipeClientPage
      recipe={recipe}
      relatedPosts={relatedPosts}
      relatedRecipes={relatedRecipes}
    />
  );
}
