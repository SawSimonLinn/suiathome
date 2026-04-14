import { communityPosts as mockCommunityPosts } from '@/lib/data';
import type { CommunityComment, CommunityPost, User } from '@/lib/types';
import { hasSupabaseEnv } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { getPublicRecipesData } from '@/lib/supabase/public-recipes';

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

export async function getPublicCommunityPosts() {
  if (!hasSupabaseEnv()) {
    return mockCommunityPosts;
  }

  const supabase = await createClient();
  const [postsResult, profilesResult, likesResult, commentsResult, publicRecipes] =
    await Promise.all([
      supabase
        .from('community_posts')
        .select(
          'id, user_id, linked_recipe_id, caption, image_path, image_hint, created_at'
        )
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, name, avatar_url'),
      supabase.from('community_post_likes').select('post_id'),
      supabase
        .from('community_post_comments')
        .select('id, post_id, user_id, body, created_at')
        .order('created_at', { ascending: true }),
      getPublicRecipesData(),
    ]);

  if (postsResult.error || !postsResult.data) {
    return [] as CommunityPost[];
  }

  const posts = (postsResult.data as CommunityPostRow[]) ?? [];
  const profiles = (profilesResult.data as CommunityProfileRow[]) ?? [];
  const likes = (likesResult.data as CommunityLikeRow[]) ?? [];
  const comments = (commentsResult.data as CommunityCommentRow[]) ?? [];

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const recipesById = new Map(publicRecipes.recipes.map((recipe) => [recipe.id, recipe]));

  const likeCounts = new Map<string, number>();
  likes.forEach((like) => {
    likeCounts.set(like.post_id, (likeCounts.get(like.post_id) || 0) + 1);
  });

  const commentsByPostId = new Map<string, CommunityComment[]>();
  comments.forEach((comment) => {
    const bucket = commentsByPostId.get(comment.post_id) || [];
    bucket.push({
      id: comment.id,
      text: comment.body,
      user: buildUser(profilesById.get(comment.user_id)),
      createdAt: comment.created_at,
    });
    commentsByPostId.set(comment.post_id, bucket);
  });

  const mappedPosts = await Promise.all(
    posts.map(async (post) => ({
      id: post.id,
      user: buildUser(profilesById.get(post.user_id)),
      caption: post.caption,
      imageUrl: await resolveCommunityImageUrl(supabase, post.image_path),
      imageHint: post.image_hint || 'community food post',
      likes: likeCounts.get(post.id) || 0,
      comments: commentsByPostId.get(post.id) || [],
      createdAt: post.created_at,
      linkedRecipe: post.linked_recipe_id
        ? recipesById.get(post.linked_recipe_id)
        : undefined,
    }))
  );

  return mappedPosts;
}
