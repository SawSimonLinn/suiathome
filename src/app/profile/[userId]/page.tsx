import { notFound } from 'next/navigation';

import { CommunityPostCard } from '@/components/community-post-card';
import { ProfileSocialLinks } from '@/components/profile-social-links';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { hasSupabaseEnv } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import type { SocialLink } from '@/lib/supabase/auth';
import type { CommunityPost, User } from '@/lib/types';

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

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  if (!hasSupabaseEnv()) notFound();

  const { userId } = await params;
  const supabase = await createClient();
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();
  const viewerId = sessionUser?.id ?? null;

  type FullProfileRow = {
    id: string;
    name: string | null;
    avatar_url: string | null;
    bio: string | null;
    social_links: SocialLink[] | null;
    created_at: string | null;
    last_active_at: string | null;
  };

  // Try the full query first; fall back to base columns if new columns don't exist yet
  let profile: FullProfileRow | null = null;
  const { data: fullProfile, error: fullError } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, bio, social_links, created_at, last_active_at')
    .eq('id', userId)
    .maybeSingle<FullProfileRow>();

  if (!fullError) {
    profile = fullProfile;
  } else {
    const { data: baseProfile } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, created_at')
      .eq('id', userId)
      .maybeSingle<Pick<FullProfileRow, 'id' | 'name' | 'avatar_url' | 'created_at'>>();
    if (baseProfile) {
      profile = { ...baseProfile, bio: null, social_links: null, last_active_at: null };
    }
  }

  if (!profile) notFound();

  const { data: myPostRows } = await supabase
    .from('community_posts')
    .select('id, caption, image_path, image_hint, created_at, linked_recipe_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const postIds = (myPostRows ?? []).map((r) => r.id);

  const [{ data: likesData }, { data: viewerLikesData }, { data: commentsData }, { data: viewsData }] = await Promise.all([
    postIds.length
      ? supabase.from('community_post_likes').select('post_id').in('post_id', postIds)
      : Promise.resolve({ data: [] }),
    viewerId && postIds.length
      ? supabase
          .from('community_post_likes')
          .select('post_id')
          .eq('user_id', viewerId)
          .in('post_id', postIds)
      : Promise.resolve({ data: [] }),
    postIds.length
      ? supabase
          .from('community_post_comments')
          .select('id, post_id, user_id, body, created_at')
          .in('post_id', postIds)
          .order('created_at', { ascending: true })
      : Promise.resolve({ data: [] }),
    postIds.length
      ? supabase.from('community_post_views').select('post_id').in('post_id', postIds)
      : Promise.resolve({ data: [] }),
  ]);

  const displayName = profile.name?.trim() || 'Community Member';
  const avatarUrl = profile.avatar_url || '';
  const bio = profile.bio?.trim() || null;
  const socialLinks: SocialLink[] = profile.social_links ?? [];
  const memberSince = profile.created_at;
  const lastActive = profile.last_active_at;

  const profileUser: User = {
    id: profile.id,
    name: displayName,
    avatarUrl,
    role: null,
  };

  const likeCounts = new Map<string, number>();
  (likesData ?? []).forEach((l: { post_id: string }) => {
    likeCounts.set(l.post_id, (likeCounts.get(l.post_id) ?? 0) + 1);
  });

  const viewerLikedPostIds = new Set(
    (viewerLikesData ?? []).map((like: { post_id: string }) => like.post_id)
  );

  const viewCounts = new Map<string, number>();
  (viewsData ?? []).forEach((view: { post_id: string }) => {
    viewCounts.set(view.post_id, (viewCounts.get(view.post_id) ?? 0) + 1);
  });

  const commentsByPost = new Map<string, { id: string; text: string; user: User; createdAt: string }[]>();
  (commentsData ?? []).forEach(
    (c: { id: string; post_id: string; user_id: string; body: string; created_at: string }) => {
      const bucket = commentsByPost.get(c.post_id) ?? [];
      bucket.push({ id: c.id, text: c.body, user: profileUser, createdAt: c.created_at });
      commentsByPost.set(c.post_id, bucket);
    }
  );

  const myPosts: CommunityPost[] = await Promise.all(
    (myPostRows ?? []).map(async (row) => {
      const imageUrl = await resolveCommunityImageUrl(supabase, row.image_path);
      return {
        id: row.id,
        user: profileUser,
        caption: row.caption,
        imageUrl,
        imageHint: row.image_hint ?? '',
        likes: likeCounts.get(row.id) ?? 0,
        views: viewCounts.get(row.id) ?? 0,
        isLiked: viewerLikedPostIds.has(row.id),
        comments: commentsByPost.get(row.id) ?? [],
        createdAt: row.created_at,
        linkedRecipeId: row.linked_recipe_id ?? null,
      };
    })
  );

  const currentUser: User | null = sessionUser
    ? {
        id: sessionUser.id,
        name:
          sessionUser.user_metadata?.name?.trim() ||
          sessionUser.email?.split('@')[0] ||
          'Cook',
        avatarUrl: sessionUser.user_metadata?.avatar_url || '',
        role: null,
      }
    : null;

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
          <h1 className="font-headline text-4xl md:text-5xl">{displayName}</h1>

          {bio && (
            <p className="mt-3 max-w-xl text-sm text-foreground/80">{bio}</p>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm md:justify-start">
            <span>
              <span className="font-semibold">{myPosts.length}</span>{' '}
              <span className="text-muted-foreground">
                {myPosts.length === 1 ? 'community post' : 'community posts'}
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

      {/* Community Posts */}
      <section className="space-y-4">
        <h2 className="font-headline text-3xl md:text-4xl">Community Posts</h2>
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
              This member hasn&apos;t shared anything in the community yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
