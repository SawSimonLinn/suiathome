import { createClient } from '@/lib/supabase/server';

export type AdminStat = {
  label: string;
  value: number | null;
  description: string;
};

export type AnalyticsTrendPoint = {
  label: string;
  likes: number;
  saves: number;
  comments: number;
  favorites: number;
};

export type TopRecipeMetric = {
  id: string;
  title: string;
  slug: string;
  likes: number;
  saves: number;
  comments: number;
  favorites: number;
  total: number;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ModerationComment = {
  id: string;
  body: string;
  createdAt: string;
  userId: string;
  userName: string;
  parentId: string;
  parentLabel: string;
  isHidden: boolean;
};

export type ModerationData = {
  recipeComments: ModerationComment[];
  communityComments: ModerationComment[];
  hiddenModerationReady: boolean;
};

type RecipeSummary = {
  id: string;
  title: string;
  slug: string;
};

type InteractionRow = {
  recipe_id: string;
  created_at: string;
};

type CountRow = {
  created_at: string;
};

type RawRecipeComment = {
  id: string;
  recipe_id: string;
  user_id: string;
  body: string;
  created_at: string;
  is_hidden?: boolean;
};

type RawCommunityComment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  is_hidden?: boolean;
};

type NamedProfile = {
  id: string;
  name: string | null;
};

type ParentRecipe = {
  id: string;
  title: string;
};

type ParentPost = {
  id: string;
  caption: string;
};

function getLastNDays(days: number) {
  const dates: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let index = days - 1; index >= 0; index -= 1) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() - index);
    dates.push(currentDate);
  }

  return dates;
}

function buildTrendPoints(days: number) {
  return getLastNDays(days).map((date) => ({
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    key: date.toISOString().slice(0, 10),
    likes: 0,
    saves: 0,
    comments: 0,
    favorites: 0,
  }));
}

function incrementTrendPoints(
  trend: ReturnType<typeof buildTrendPoints>,
  rows: CountRow[],
  field: 'likes' | 'saves' | 'comments' | 'favorites'
) {
  const lookup = new Map(trend.map((point) => [point.key, point]));

  rows.forEach((row) => {
    const key = new Date(row.created_at).toISOString().slice(0, 10);
    const target = lookup.get(key);

    if (target) {
      target[field] += 1;
    }
  });
}

async function getCount(table: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    return null;
  }

  return count ?? 0;
}

async function getRecipeSummaries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, slug')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return [] as RecipeSummary[];
  }

  return (data as RecipeSummary[]) ?? [];
}

async function getInteractionRows(table: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select('recipe_id, created_at');

  if (error) {
    return [] as InteractionRow[];
  }

  return (data as InteractionRow[]) ?? [];
}

async function getCountRows(table: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).select('created_at');

  if (error) {
    return [] as CountRow[];
  }

  return (data as CountRow[]) ?? [];
}

export async function getRecentProfiles(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, role, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getAdminDashboardData() {
  const [
    totalUsers,
    totalRecipes,
    totalRecipeLikes,
    totalRecipeSaves,
    totalRecipeFavorites,
    totalRecipeComments,
    totalCommunityPosts,
    recentProfiles,
    recipes,
    likeRows,
    saveRows,
    favoriteRows,
    commentRows,
  ] = await Promise.all([
    getCount('profiles'),
    getCount('recipes'),
    getCount('recipe_likes'),
    getCount('recipe_saves'),
    getCount('recipe_favorites'),
    getCount('recipe_comments'),
    getCount('community_posts'),
    getRecentProfiles(),
    getRecipeSummaries(),
    getInteractionRows('recipe_likes'),
    getInteractionRows('recipe_saves'),
    getInteractionRows('recipe_favorites'),
    getInteractionRows('recipe_comments'),
  ]);

  const stats: AdminStat[] = [
    {
      label: 'Users',
      value: totalUsers,
      description: 'Profiles created through Supabase Auth.',
    },
    {
      label: 'Recipes',
      value: totalRecipes,
      description: 'Published recipes stored in your database.',
    },
    {
      label: 'Recipe Likes',
      value: totalRecipeLikes,
      description: 'All likes across recipe cards and recipe detail pages.',
    },
    {
      label: 'Saves',
      value: totalRecipeSaves,
      description: 'Recipes users saved to revisit later.',
    },
    {
      label: 'Favorites',
      value: totalRecipeFavorites,
      description: 'Recipes users marked as all-time favorites.',
    },
    {
      label: 'Recipe Comments',
      value: totalRecipeComments,
      description: 'Comments currently attached to recipes.',
    },
    {
      label: 'Community Posts',
      value: totalCommunityPosts,
      description: 'Posts shared by the community feed.',
    },
  ];

  const metricsByRecipe = new Map<
    string,
    {
      id: string;
      title: string;
      slug: string;
      likes: number;
      saves: number;
      comments: number;
      favorites: number;
    }
  >(
    recipes.map((recipe) => [
      recipe.id,
      {
        ...recipe,
        likes: 0,
        saves: 0,
        comments: 0,
        favorites: 0,
      },
    ])
  );

  likeRows.forEach((row) => {
    const target = metricsByRecipe.get(row.recipe_id);
    if (target) target.likes += 1;
  });

  saveRows.forEach((row) => {
    const target = metricsByRecipe.get(row.recipe_id);
    if (target) target.saves += 1;
  });

  favoriteRows.forEach((row) => {
    const target = metricsByRecipe.get(row.recipe_id);
    if (target) target.favorites += 1;
  });

  commentRows.forEach((row) => {
    const target = metricsByRecipe.get(row.recipe_id);
    if (target) target.comments += 1;
  });

  const topRecipes: TopRecipeMetric[] = [...metricsByRecipe.values()]
    .map((recipe) => ({
      ...recipe,
      total:
        recipe.likes + recipe.saves + recipe.comments + recipe.favorites,
    }))
    .filter((recipe) => recipe.total > 0)
    .sort((left, right) => right.total - left.total)
    .slice(0, 6);

  const engagementTrendRaw = buildTrendPoints(14);
  incrementTrendPoints(engagementTrendRaw, likeRows, 'likes');
  incrementTrendPoints(engagementTrendRaw, saveRows, 'saves');
  incrementTrendPoints(engagementTrendRaw, favoriteRows, 'favorites');
  incrementTrendPoints(engagementTrendRaw, commentRows, 'comments');

  const engagementTrend: AnalyticsTrendPoint[] = engagementTrendRaw.map(
    ({ key: _key, ...point }) => point
  );

  return {
    stats,
    recentProfiles,
    topRecipes,
    engagementTrend,
  };
}

export async function getAdminCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error) {
    return [] as AdminCategory[];
  }

  return (data as AdminCategory[]) ?? [];
}

async function getProfilesByIds(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, string>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', userIds);

  if (error) {
    return new Map<string, string>();
  }

  return new Map(
    ((data as NamedProfile[]) ?? []).map((profile) => [
      profile.id,
      profile.name || 'Unnamed user',
    ])
  );
}

async function getRecipeTitles(recipeIds: string[]) {
  if (recipeIds.length === 0) {
    return new Map<string, string>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('recipes')
    .select('id, title')
    .in('id', recipeIds);

  if (error) {
    return new Map<string, string>();
  }

  return new Map(
    ((data as ParentRecipe[]) ?? []).map((recipe) => [recipe.id, recipe.title])
  );
}

async function getCommunityPostCaptions(postIds: string[]) {
  if (postIds.length === 0) {
    return new Map<string, string>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('community_posts')
    .select('id, caption')
    .in('id', postIds);

  if (error) {
    return new Map<string, string>();
  }

  return new Map(
    ((data as ParentPost[]) ?? []).map((post) => [post.id, post.caption])
  );
}

async function getRecipeCommentsForModeration(limit: number) {
  const supabase = await createClient();
  const withHidden = await supabase
    .from('recipe_comments')
    .select('id, recipe_id, user_id, body, created_at, is_hidden')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!withHidden.error) {
    return {
      comments: (withHidden.data as RawRecipeComment[]) ?? [],
      hiddenModerationReady: true,
    };
  }

  const fallback = await supabase
    .from('recipe_comments')
    .select('id, recipe_id, user_id, body, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (fallback.error) {
    return {
      comments: [] as RawRecipeComment[],
      hiddenModerationReady: false,
    };
  }

  return {
    comments: (fallback.data as RawRecipeComment[]) ?? [],
    hiddenModerationReady: false,
  };
}

async function getCommunityCommentsForModeration(limit: number) {
  const supabase = await createClient();
  const withHidden = await supabase
    .from('community_post_comments')
    .select('id, post_id, user_id, body, created_at, is_hidden')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!withHidden.error) {
    return {
      comments: (withHidden.data as RawCommunityComment[]) ?? [],
      hiddenModerationReady: true,
    };
  }

  const fallback = await supabase
    .from('community_post_comments')
    .select('id, post_id, user_id, body, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (fallback.error) {
    return {
      comments: [] as RawCommunityComment[],
      hiddenModerationReady: false,
    };
  }

  return {
    comments: (fallback.data as RawCommunityComment[]) ?? [],
    hiddenModerationReady: false,
  };
}

export async function getCommentModerationData(limit = 20): Promise<ModerationData> {
  const [recipeCommentResult, communityCommentResult] = await Promise.all([
    getRecipeCommentsForModeration(limit),
    getCommunityCommentsForModeration(limit),
  ]);

  const userIds = Array.from(
    new Set([
      ...recipeCommentResult.comments.map((comment) => comment.user_id),
      ...communityCommentResult.comments.map((comment) => comment.user_id),
    ])
  );
  const recipeIds = Array.from(
    new Set(recipeCommentResult.comments.map((comment) => comment.recipe_id))
  );
  const postIds = Array.from(
    new Set(communityCommentResult.comments.map((comment) => comment.post_id))
  );

  const [profileNames, recipeTitles, postCaptions] = await Promise.all([
    getProfilesByIds(userIds),
    getRecipeTitles(recipeIds),
    getCommunityPostCaptions(postIds),
  ]);

  return {
    recipeComments: recipeCommentResult.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.created_at,
      userId: comment.user_id,
      userName: profileNames.get(comment.user_id) || 'Unknown user',
      parentId: comment.recipe_id,
      parentLabel: recipeTitles.get(comment.recipe_id) || 'Unknown recipe',
      isHidden: Boolean(comment.is_hidden),
    })),
    communityComments: communityCommentResult.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.created_at,
      userId: comment.user_id,
      userName: profileNames.get(comment.user_id) || 'Unknown user',
      parentId: comment.post_id,
      parentLabel:
        postCaptions.get(comment.post_id)?.slice(0, 80) || 'Unknown post',
      isHidden: Boolean(comment.is_hidden),
    })),
    hiddenModerationReady:
      recipeCommentResult.hiddenModerationReady &&
      communityCommentResult.hiddenModerationReady,
  };
}
