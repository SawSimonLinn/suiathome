import { createClient } from '@/lib/supabase/server';

export type AdminStat = {
  label: string;
  value: number | null;
  description: string;
};

export type AnalyticsTrendPoint = {
  label: string;
  likes: number;
  comments: number;
  favorites: number;
};

export type TopRecipeMetric = {
  id: string;
  title: string;
  slug: string;
  likes: number;
  comments: number;
  favorites: number;
  total: number;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
};

export type AdminRecipeListItem = {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  createdAt: string;
};

export type AdminEditableRecipe = {
  id: string;
  title: string;
  slug: string;
  description: string;
  story: string;
  imageHint: string;
  imageUrls: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  categoryId: string;
  ingredients: { quantity: string; name: string }[];
  steps: string[];
  tips: string[];
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
    comments: 0,
    favorites: 0,
  }));
}

function incrementTrendPoints(
  trend: ReturnType<typeof buildTrendPoints>,
  rows: CountRow[],
  field: 'likes' | 'comments' | 'favorites'
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
    totalRecipeFavorites,
    totalRecipeComments,
    totalCommunityPosts,
    recentProfiles,
    recipes,
    likeRows,
    favoriteRows,
    commentRows,
  ] = await Promise.all([
    getCount('profiles'),
    getCount('recipes'),
    getCount('recipe_likes'),
    getCount('recipe_favorites'),
    getCount('recipe_comments'),
    getCount('community_posts'),
    getRecentProfiles(),
    getRecipeSummaries(),
    getInteractionRows('recipe_likes'),
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
      comments: number;
      favorites: number;
    }
  >(
    recipes.map((recipe) => [
      recipe.id,
      {
        ...recipe,
        likes: 0,
        comments: 0,
        favorites: 0,
      },
    ])
  );

  likeRows.forEach((row) => {
    const target = metricsByRecipe.get(row.recipe_id);
    if (target) target.likes += 1;
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
      total: recipe.likes + recipe.comments + recipe.favorites,
    }))
    .filter((recipe) => recipe.total > 0)
    .sort((left, right) => right.total - left.total)
    .slice(0, 6);

  const engagementTrendRaw = buildTrendPoints(14);
  incrementTrendPoints(engagementTrendRaw, likeRows, 'likes');
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

export async function getCategoriesWithRecipeCount() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, recipes(id)')
    .order('name', { ascending: true });

  if (error) return [] as (AdminCategory & { recipeCount: number })[];

  return ((data as unknown as (AdminCategory & { recipes: { id: string }[] })[]) ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    recipeCount: c.recipes?.length ?? 0,
  }));
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
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

export async function getAdminRecipeList(limit = 100) {
  const supabase = await createClient();
  const [recipesResult, categoriesResult] = await Promise.all([
    supabase
      .from('recipes')
      .select('id, title, slug, category_id, created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase.from('categories').select('id, name'),
  ]);

  if (recipesResult.error || !recipesResult.data) {
    return [] as AdminRecipeListItem[];
  }

  const categoriesById = new Map(
    (((categoriesResult.data as { id: string; name: string }[] | null) ?? [])).map(
      (category) => [category.id, category.name]
    )
  );

  return (
    (recipesResult.data as {
      id: string;
      title: string;
      slug: string;
      category_id: string;
      created_at: string;
    }[]).map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      categoryName: categoriesById.get(recipe.category_id) || 'Uncategorized',
      createdAt: recipe.created_at,
    })) ?? []
  );
}

export async function getAdminRecipeForEdit(recipeId: string) {
  const supabase = await createClient();
  const [
    recipeResult,
    ingredientResult,
    stepResult,
    tipResult,
    imageResult,
  ] = await Promise.all([
    supabase
      .from('recipes')
      .select(
        'id, title, slug, description, story, image_url, image_hint, prep_time, cook_time, servings, category_id'
      )
      .eq('id', recipeId)
      .maybeSingle(),
    supabase
      .from('recipe_ingredients')
      .select('quantity, name, position')
      .eq('recipe_id', recipeId)
      .order('position', { ascending: true }),
    supabase
      .from('recipe_steps')
      .select('body, position')
      .eq('recipe_id', recipeId)
      .order('position', { ascending: true }),
    supabase
      .from('recipe_tips')
      .select('body, position')
      .eq('recipe_id', recipeId)
      .order('position', { ascending: true }),
    supabase
      .from('recipe_images')
      .select('url, position')
      .eq('recipe_id', recipeId)
      .order('position', { ascending: true }),
  ]);

  if (recipeResult.error || !recipeResult.data) {
    return null as AdminEditableRecipe | null;
  }

  const recipe = recipeResult.data as {
    id: string;
    title: string;
    slug: string;
    description: string;
    story: string;
    image_url: string | null;
    image_hint: string | null;
    prep_time: string;
    cook_time: string;
    servings: number;
    category_id: string;
  };

  const extraImages =
    ((imageResult.data as { url: string; position: number }[] | null) ?? []).map(
      (image) => image.url
    );

  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description,
    story: recipe.story,
    imageHint: recipe.image_hint || '',
    imageUrls: [recipe.image_url, ...extraImages].filter(
      (url): url is string => Boolean(url)
    ),
    prepTime: recipe.prep_time,
    cookTime: recipe.cook_time,
    servings: recipe.servings,
    categoryId: recipe.category_id,
    ingredients: (
      (ingredientResult.data as
        | { quantity: string; name: string; position: number }[]
        | null) ?? []
    ).map((ingredient) => ({
      quantity: ingredient.quantity,
      name: ingredient.name,
    })),
    steps: (
      (stepResult.data as { body: string; position: number }[] | null) ?? []
    ).map((step) => step.body),
    tips: (
      (tipResult.data as { body: string; position: number }[] | null) ?? []
    ).map((tip) => tip.body),
  };
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
