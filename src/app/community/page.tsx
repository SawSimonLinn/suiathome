import { CommunityPageClient } from './community-page-client';
import { getAuthContext, type AuthContext } from '@/lib/supabase/auth';
import { getPublicCommunityPosts } from '@/lib/supabase/public-community';
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
  };
}

export default async function CommunityPage() {
  const [authContext, posts] = await Promise.all([
    getAuthContext(),
    getPublicCommunityPosts(),
  ]);

  return (
    <CommunityPageClient
      initialPosts={posts}
      currentUser={buildCurrentUser(authContext)}
    />
  );
}
