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
};

type CommunityLikeRow = {
  post_id: string;
};

type CommunityCommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

function buildUser(profile: CommunityProfileRow | undefined): User {
  return {
    id: profile?.id || 'unknown-user',
    name: profile?.name?.trim() || 'Sui at home',
    avatarUrl: profile?.avatar_url || '',
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

  const [postsResult, profilesResult, likesResult, commentsResult] =
    await Promise.all([
      postsQuery,
      supabase.from('profiles').select('id, name, avatar_url'),
      supabase.from('community_post_likes').select('post_id'),
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
  const comments = (commentsResult.data as CommunityCommentRow[]) ?? [];

  const visiblePostIds = new Set(posts.map((post) => post.id));
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  const likeCounts = new Map<string, number>();
  likes.forEach((like) => {
    if (!visiblePostIds.has(like.post_id)) return;
    likeCounts.set(like.post_id, (likeCounts.get(like.post_id) || 0) + 1);
  });

  const commentsByPostId = new Map<string, CommunityComment[]>();
  comments.forEach((comment) => {
    if (!visiblePostIds.has(comment.post_id)) return;
    const bucket = commentsByPostId.get(comment.post_id) || [];
    bucket.push({
      id: comment.id,
      text: comment.body,
      user: buildUser(profilesById.get(comment.user_id)),
      createdAt: comment.created_at,
    });
    commentsByPostId.set(comment.post_id, bucket);
  });

  return Promise.all(
    posts.map(async (post) => ({
      id: post.id,
      user: buildUser(profilesById.get(post.user_id)),
      caption: post.caption,
      imageUrl: await resolveCommunityImageUrl(supabase, post.image_path),
      imageHint: post.image_hint || 'community food post',
      likes: likeCounts.get(post.id) || 0,
      comments: commentsByPostId.get(post.id) || [],
      createdAt: post.created_at,
    }))
  );
}

export async function getPublicCommunityPosts() {
  if (!hasSupabaseEnv()) {
    return mockCommunityPosts;
  }

  return getCommunityPostsFromSupabase({});
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
