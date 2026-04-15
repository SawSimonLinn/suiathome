import { communityPosts as mockCommunityPosts } from '@/lib/data';
import type { CommunityComment, CommunityPost, User } from '@/lib/types';
import { hasSupabaseEnv } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

type CommunityPostRow = {
  id: string;
  user_id: string;
  linked_recipe_id: string | null;
  caption: string;
  image_path: string | null;
  image_hint: string | null;
  created_at: string;
};

type CommunityProfileRow = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | null;
};

type CommunityLikeRow = {
  post_id: string;
};

type CommunityViewRow = {
  post_id: string;
};

type CommunityCommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

function buildUser(userId: string, profile: CommunityProfileRow | undefined): User {
  return {
    id: userId,
    name: profile?.name?.trim() || 'Community Member',
    avatarUrl: profile?.avatar_url || '',
    role: profile?.role || null,
  };
}

async function resolveCommunityImageUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  imagePath: string | null
) {
  if (!imagePath) {
    return '';
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const { data } = supabase.storage
    .from('community-images')
    .getPublicUrl(imagePath);

  return data.publicUrl;
}

type CommunityPostsOptions = {
  linkedRecipeId?: string;
  limit?: number;
};

async function getCommunityPostsFromSupabase({
  linkedRecipeId,
  limit,
}: CommunityPostsOptions) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewerId = user?.id ?? null;
  let postsQuery = supabase
    .from('community_posts')
    .select(
      'id, user_id, linked_recipe_id, caption, image_path, image_hint, created_at'
    )
    .order('created_at', { ascending: false });

  if (linkedRecipeId) {
    postsQuery = postsQuery.eq('linked_recipe_id', linkedRecipeId);
  }

  if (limit) {
    postsQuery = postsQuery.limit(limit);
  }

  const [
    postsResult,
    profilesResult,
    likesResult,
    viewerLikesResult,
    viewsResult,
    commentsResult,
  ] =
    await Promise.all([
      postsQuery,
      supabase.from('profiles').select('id, name, avatar_url, role'),
      supabase.from('community_post_likes').select('post_id'),
      viewerId
        ? supabase
            .from('community_post_likes')
            .select('post_id')
            .eq('user_id', viewerId)
        : Promise.resolve({ data: [], error: null }),
      supabase.from('community_post_views').select('post_id'),
      supabase
        .from('community_post_comments')
        .select('id, post_id, user_id, body, created_at')
        .order('created_at', { ascending: true }),
    ]);

  if (postsResult.error || !postsResult.data) {
    return [] as CommunityPost[];
  }

  const posts = (postsResult.data as CommunityPostRow[]) ?? [];
  const profiles = (profilesResult.data as CommunityProfileRow[]) ?? [];
  const likes = (likesResult.data as CommunityLikeRow[]) ?? [];
  const viewerLikeRows = (viewerLikesResult.data as CommunityLikeRow[]) ?? [];
  const views = (viewsResult.data as CommunityViewRow[]) ?? [];
  const comments = (commentsResult.data as CommunityCommentRow[]) ?? [];

  const visiblePostIds = new Set(posts.map((post) => post.id));
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  const likeCounts = new Map<string, number>();
  likes.forEach((like) => {
    if (!visiblePostIds.has(like.post_id)) return;
    likeCounts.set(like.post_id, (likeCounts.get(like.post_id) || 0) + 1);
  });

  const viewerLikedPostIds = new Set(
    viewerLikeRows
      .map((like) => like.post_id)
      .filter((postId) => visiblePostIds.has(postId))
  );

  const viewCounts = new Map<string, number>();
  views.forEach((view) => {
    if (!visiblePostIds.has(view.post_id)) return;
    viewCounts.set(view.post_id, (viewCounts.get(view.post_id) || 0) + 1);
  });

  const commentsByPostId = new Map<string, CommunityComment[]>();
  comments.forEach((comment) => {
    if (!visiblePostIds.has(comment.post_id)) return;
    const bucket = commentsByPostId.get(comment.post_id) || [];
    bucket.push({
      id: comment.id,
      text: comment.body,
      user: buildUser(comment.user_id, profilesById.get(comment.user_id)),
      createdAt: comment.created_at,
    });
    commentsByPostId.set(comment.post_id, bucket);
  });

  return Promise.all(
    posts.map(async (post) => ({
      id: post.id,
      user: buildUser(post.user_id, profilesById.get(post.user_id)),
      caption: post.caption,
      imageUrl: await resolveCommunityImageUrl(supabase, post.image_path),
      imageHint: post.image_hint || 'community food post',
      likes: likeCounts.get(post.id) || 0,
      views: viewCounts.get(post.id) || 0,
      isLiked: viewerLikedPostIds.has(post.id),
      comments: commentsByPostId.get(post.id) || [],
      createdAt: post.created_at,
      linkedRecipeId: post.linked_recipe_id,
    }))
  );
}

export async function getPublicCommunityPosts() {
  if (!hasSupabaseEnv()) {
    return mockCommunityPosts;
  }

  return getCommunityPostsFromSupabase({});
}

export async function getTopTriedItPosts(limit = 10) {
  if (!hasSupabaseEnv()) {
    return mockCommunityPosts
      .filter((post) => post.linkedRecipe != null)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit)
      .map(({ linkedRecipe, ...post }) => post);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewerId = user?.id ?? null;

  // Fetch posts that are linked to a recipe, with like counts via subquery
  const { data: postsData, error } = await supabase
    .from('community_posts')
    .select('id, user_id, linked_recipe_id, caption, image_path, image_hint, created_at')
    .not('linked_recipe_id', 'is', null)
    .limit(100); // fetch more to sort by likes client-side

  if (error || !postsData) return [] as CommunityPost[];

  const posts = postsData as CommunityPostRow[];
  const postIds = posts.map((p) => p.id);

  const [profilesResult, likesResult, viewerLikesResult, viewsResult] = await Promise.all([
    supabase.from('profiles').select('id, name, avatar_url, role'),
    supabase.from('community_post_likes').select('post_id').in('post_id', postIds),
    viewerId
      ? supabase
          .from('community_post_likes')
          .select('post_id')
          .eq('user_id', viewerId)
          .in('post_id', postIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from('community_post_views').select('post_id').in('post_id', postIds),
  ]);

  const profiles = (profilesResult.data as CommunityProfileRow[]) ?? [];
  const likes = (likesResult.data as CommunityLikeRow[]) ?? [];
  const viewerLikeRows = (viewerLikesResult.data as CommunityLikeRow[]) ?? [];
  const views = (viewsResult.data as CommunityViewRow[]) ?? [];
  const profilesById = new Map(profiles.map((p) => [p.id, p]));

  const likeCounts = new Map<string, number>();
  likes.forEach((like) => {
    likeCounts.set(like.post_id, (likeCounts.get(like.post_id) || 0) + 1);
  });

  const viewerLikedPostIds = new Set(viewerLikeRows.map((like) => like.post_id));

  const viewCounts = new Map<string, number>();
  views.forEach((view) => {
    viewCounts.set(view.post_id, (viewCounts.get(view.post_id) || 0) + 1);
  });

  const resolved = await Promise.all(
    posts.map(async (post) => ({
      id: post.id,
      user: buildUser(post.user_id, profilesById.get(post.user_id)),
      caption: post.caption,
      imageUrl: await resolveCommunityImageUrl(supabase, post.image_path),
      imageHint: post.image_hint || 'community food post',
      likes: likeCounts.get(post.id) || 0,
      views: viewCounts.get(post.id) || 0,
      isLiked: viewerLikedPostIds.has(post.id),
      comments: [],
      createdAt: post.created_at,
      linkedRecipeId: post.linked_recipe_id,
    }))
  );

  return resolved
    .sort((a, b) => b.likes - a.likes)
    .slice(0, limit);
}

export async function getPublicCommunityPostsByRecipeId(
  recipeId: string,
  limit = 4
) {
  if (!hasSupabaseEnv()) {
    return mockCommunityPosts
      .filter((post) => post.linkedRecipe?.id === recipeId)
      .slice(0, limit)
      .map(({ linkedRecipe, ...post }) => post);
  }

  return getCommunityPostsFromSupabase({ linkedRecipeId: recipeId, limit });
}
