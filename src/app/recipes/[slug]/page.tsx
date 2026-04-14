import { notFound } from 'next/navigation';
import { getAuthContext, type AuthContext } from '@/lib/supabase/auth';
import { getPublicRecipeBySlug, getRelatedPublicRecipes } from '@/lib/supabase/public-recipes';
import { getPublicCommunityPostsByRecipeId } from '@/lib/supabase/public-community';
import type { User } from '@/lib/types';
import RecipeClientPage from './RecipeClientPage';

function buildCurrentUser(authContext: AuthContext): User | null {
  if (!authContext.isLoggedIn || !authContext.userId) {
    return null;
  }

  return {
    id: authContext.userId,
    name:
      authContext.profile?.name?.trim() ||
      authContext.userEmail?.split('@')[0] ||
      'Cook',
    avatarUrl: authContext.profile?.avatar_url || '',
    role: authContext.profile?.role || null,
  };
}

export default async function RecipeDetailPage({ params }: { params: { slug:string } }) {
  const recipe = await getPublicRecipeBySlug(params.slug);

  if (!recipe) {
    notFound();
  }
  
  const [authContext, relatedRecipes, relatedPosts] = await Promise.all([
    getAuthContext(),
    getRelatedPublicRecipes(recipe, 3),
    getPublicCommunityPostsByRecipeId(recipe.id, 4),
  ]);

  return (
    <RecipeClientPage
      recipe={recipe}
      relatedPosts={relatedPosts}
      relatedRecipes={relatedRecipes}
      currentUser={buildCurrentUser(authContext)}
    />
  );
}
