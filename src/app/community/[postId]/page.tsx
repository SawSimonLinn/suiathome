import { notFound } from 'next/navigation';

import { CommunityPostDetailClient } from './community-post-detail-client';
import { getAuthContext } from '@/lib/supabase/auth';
import { getCommunityPostById } from '@/lib/supabase/public-community';
import { getPublicRecipesData } from '@/lib/supabase/public-recipes';
import type { User } from '@/lib/types';

type Props = {
  params: Promise<{ postId: string }>;
};

function buildCurrentUser(authContext: Awaited<ReturnType<typeof getAuthContext>>): User | null {
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

export default async function CommunityPostDetailPage({ params }: Props) {
  const { postId } = await params;

  const [authContext, post, recipeData] = await Promise.all([
    getAuthContext(),
    getCommunityPostById(postId),
    getPublicRecipesData(),
  ]);

  if (!post) {
    notFound();
  }

  const linkedRecipe = post.linkedRecipeId
    ? recipeData.recipes.find((r) => r.id === post.linkedRecipeId)
    : null;

  return (
    <CommunityPostDetailClient
      post={post}
      currentUser={buildCurrentUser(authContext)}
      availableRecipes={recipeData.recipes}
      linkedRecipe={linkedRecipe ?? null}
    />
  );
}
