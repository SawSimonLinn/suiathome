import { notFound } from 'next/navigation';
import { getRecipeBySlug, getCommunityPostsByRecipeId, getRelatedRecipes } from '@/lib/data';
import RecipeClientPage from './RecipeClientPage';

export default function RecipeDetailPage({ params }: { params: { slug:string } }) {
  const recipe = getRecipeBySlug(params.slug);

  if (!recipe) {
    notFound();
  }
  
  const relatedPosts = getCommunityPostsByRecipeId(recipe.id, 2);
  const relatedRecipes = getRelatedRecipes(recipe, 3);

  return (
    <RecipeClientPage
      recipe={recipe}
      relatedPosts={relatedPosts}
      relatedRecipes={relatedRecipes}
    />
  );
}
