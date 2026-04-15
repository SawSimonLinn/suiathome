import Link from 'next/link';
import { redirect } from 'next/navigation';

import { CommunityPostCard } from '@/components/community-post-card';
import { ProfileSocialLinks } from '@/components/profile-social-links';
import { RecipeImageCard } from '@/components/recipe-image-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { hasSupabaseEnv } from '@/lib/supabase/config';
import { getPublicRecipesData } from '@/lib/supabase/public-recipes';
import { createClient } from '@/lib/supabase/server';
import type { SocialLink } from '@/lib/supabase/auth';
import type { CommunityPost, User } from '@/lib/types';

type ProfileRow = {
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  social_links: SocialLink[] | null;
  created_at: string | null;
  last_active_at: string | null;
};

function getInitials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

function formatLastActive(date: string) {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 2) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return formatDate(date);
}

async function resolveCommunityImageUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  imagePath: string | null
) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const { data } = supabase.storage
    .from('community-images')
    .getPublicUrl(imagePath);
  return data.publicUrl;
}

export default async function ProfilePage() {
  const supabaseReady = hasSupabaseEnv();

  if (!supabaseReady) {
    redirect('/login?error=Add%20your%20Supabase%20env%20vars%20first.');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/profile');
  }

  // Try extended query; fall back to base columns if migration hasn't run yet
  let profile: ProfileRow | null = null;
  const { data: fullProfile, error: fullError } = await supabase
    .from('profiles')
    .select('name, avatar_url, bio, social_links, created_at, last_active_at')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (!fullError) {
    profile = fullProfile;
  } else {
    const { data: baseProfile } = await supabase
      .from('profiles')
      .select('name, avatar_url, created_at')
      .eq('id', user.id)
      .maybeSingle<Pick<ProfileRow, 'name' | 'avatar_url' | 'created_at'>>();
    if (baseProfile) {
      profile = { ...baseProfile, bio: null, social_links: null, last_active_at: null };
    }
  }

  const [{ data: favoritedRows }, recipeData, { data: myPostRows }] =
    await Promise.all([
      supabase.from('recipe_favorites').select('recipe_id').eq('user_id', user.id),
      getPublicRecipesData(),
      supabase
        .from('community_posts')
        .select('id, caption, image_path, image_hint, created_at, linked_recipe_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

  const postIds = (myPostRows ?? []).map((row) => row.id);
  const [{ data: myPostLikes }, { data: myViewerLikes }, { data: myPostViews }] = await Promise.all([
    postIds.length
      ? supabase
          .from('community_post_likes')
          .select('post_id')
          .in('post_id', postIds)
      : Promise.resolve({ data: [] }),
    postIds.length
      ? supabase
          .from('community_post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds)
      : Promise.resolve({ data: [] }),
    postIds.length
      ? supabase
          .from('community_post_views')
          .select('post_id')
          .in('post_id', postIds)
      : Promise.resolve({ data: [] }),
  ]);

  const displayName =
    profile?.name?.trim() ||
    user.user_metadata.name?.trim() ||
    user.email?.split('@')[0] ||
    'Cook';
  const avatarUrl = profile?.avatar_url || user.user_metadata.avatar_url || '';
  const bio = profile?.bio?.trim() || null;
  const socialLinks: SocialLink[] = profile?.social_links ?? [];
  const memberSince = profile?.created_at || user.created_at;
  const lastActive = profile?.last_active_at || null;

  const favoritedIds = new Set((favoritedRows ?? []).map((r) => r.recipe_id));
  const favoritedRecipes = recipeData.recipes.filter((r) => favoritedIds.has(r.id));

  const currentUser: User = {
    id: user.id,
    name: displayName,
    avatarUrl,
    role: null,
  };

  const likeCounts = new Map<string, number>();
  (myPostLikes ?? []).forEach((like: { post_id: string }) => {
    likeCounts.set(like.post_id, (likeCounts.get(like.post_id) ?? 0) + 1);
  });

  const viewerLikedPostIds = new Set(
    (myViewerLikes ?? []).map((like: { post_id: string }) => like.post_id)
  );

  const viewCounts = new Map<string, number>();
  (myPostViews ?? []).forEach((view: { post_id: string }) => {
    viewCounts.set(view.post_id, (viewCounts.get(view.post_id) ?? 0) + 1);
  });

  const myPosts: CommunityPost[] = await Promise.all(
    (myPostRows ?? []).map(async (row) => {
      const imageUrl = await resolveCommunityImageUrl(supabase, row.image_path);
      return {
        id: row.id,
        user: currentUser,
        caption: row.caption,
        imageUrl,
        imageHint: row.image_hint ?? '',
        likes: likeCounts.get(row.id) ?? 0,
        views: viewCounts.get(row.id) ?? 0,
        isLiked: viewerLikedPostIds.has(row.id),
        comments: [],
        createdAt: row.created_at,
        linkedRecipeId: row.linked_recipe_id ?? null,
      };
    })
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Profile header */}
      <header className="mb-10 flex flex-col items-center gap-6 border-2 border-foreground bg-paper p-8 paper-shadow md:flex-row md:items-start md:gap-8">
        <Avatar className="h-24 w-24 shrink-0 md:h-32 md:w-32">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-4xl">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col items-center gap-3 md:flex-row md:items-start md:justify-between">
            <h1 className="font-headline text-4xl md:text-5xl">{displayName}</h1>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">Edit Profile</Link>
            </Button>
          </div>

          {bio && (
            <p className="mt-3 max-w-xl text-sm text-foreground/80">{bio}</p>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm md:justify-start">
            <span>
              <span className="font-semibold">{favoritedRecipes.length}</span>{' '}
              <span className="text-muted-foreground">favorites</span>
            </span>
            <span>
              <span className="font-semibold">{myPosts.length}</span>{' '}
              <span className="text-muted-foreground">
                {myPosts.length === 1 ? 'post' : 'posts'}
              </span>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground md:justify-start">
            {memberSince && (
              <span>Member since {formatDate(memberSince)}</span>
            )}
            {lastActive && (
              <span>Last active {formatLastActive(lastActive)}</span>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className="mt-4 flex justify-center md:justify-start">
              <ProfileSocialLinks links={socialLinks} />
            </div>
          )}
        </div>
      </header>

      {/* Favorite Recipes */}
      <section className="mb-12 space-y-4">
        <h2 className="font-headline text-3xl md:text-4xl">Favorite Recipes</h2>
        {favoritedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoritedRecipes.map((recipe) => (
              <RecipeImageCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="border-2 border-foreground bg-paper py-12 text-center paper-shadow">
            <p className="text-lg font-semibold">No favorites yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap Favorite on any recipe and it will show up here.
            </p>
          </div>
        )}
      </section>

      {/* Community Posts */}
      <section className="space-y-4">
        <h2 className="font-headline text-3xl md:text-4xl">My Community Posts</h2>
        {myPosts.length > 0 ? (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {myPosts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
              />
            ))}
          </div>
        ) : (
          <div className="border-2 border-foreground bg-paper py-12 text-center paper-shadow">
            <p className="text-lg font-semibold">No posts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Share a photo or thought in the community and it will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
