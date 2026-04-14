import { notFound } from 'next/navigation';
import { getPublicRecipeBySlug, getRelatedPublicRecipes } from '@/lib/supabase/public-recipes';
import RecipeClientPage from './RecipeClientPage';

export default async function RecipeDetailPage({ params }: { params: { slug:string } }) {
  const recipe = await getPublicRecipeBySlug(params.slug);

  if (!recipe) {
    notFound();
  }
  
  const relatedRecipes = await getRelatedPublicRecipes(recipe, 3);

  return (
    <RecipeClientPage
      recipe={recipe}
      relatedPosts={[]}
      relatedRecipes={relatedRecipes}
    />
  );
}
