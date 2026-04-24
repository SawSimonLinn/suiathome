import { notFound } from 'next/navigation';
import { getAuthContext, type AuthContext } from '@/lib/supabase/auth';
import {
  getPublicRecipeByIdentifier,
  getRelatedPublicRecipes,
} from '@/lib/supabase/public-recipes';
import { getPublicCommunityPostsByRecipeId } from '@/lib/supabase/public-community';
import type { User } from '@/lib/types';
import RecipeClientPage from './RecipeClientPage';

type RecipeDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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

export default async function RecipeDetailPage({
  params,
}: RecipeDetailPageProps) {
  const { slug: recipeIdentifier } = await params;
  const recipe = await getPublicRecipeByIdentifier(recipeIdentifier);

  if (!recipe) {
    notFound();
  }
  
  const [authContext, relatedRecipes, relatedPosts] = await Promise.all([
    getAuthContext(),
    getRelatedPublicRecipes(recipe, 5),
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
