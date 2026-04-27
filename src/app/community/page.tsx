import { CommunityPageClient } from './community-page-client';
import { getAuthContext, type AuthContext } from '@/lib/supabase/auth';
import { getPublicCommunityPostsPage } from '@/lib/supabase/public-community';
import { getPublicRecipesData } from '@/lib/supabase/public-recipes';
import type { User } from '@/lib/types';

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

export default async function CommunityPage() {
  const [authContext, postsResult, recipeData] = await Promise.all([
    getAuthContext(),
    getPublicCommunityPostsPage(0),
    getPublicRecipesData(),
  ]);

  return (
    <CommunityPageClient
      initialPosts={postsResult.posts}
      initialHasMore={postsResult.hasMore}
      availableRecipes={recipeData.recipes}
      currentUser={buildCurrentUser(authContext)}
    />
  );
}
