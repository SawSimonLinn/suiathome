import { categories as mockCategories, recipes as mockRecipes } from '@/lib/data';
import type { Category, Comment, Recipe, User } from '@/lib/types';
import { hasSupabaseEnv } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

type RecipeRow = {
  id: string;
  author_id: string;
  category_id: string;
  slug: string;
  title: string;
  description: string;
  story: string;
  image_url: string | null;
  image_hint: string | null;
  cover_position: string | null;
  reel_url: string | null;
  prep_time: string;
  cook_time: string;
  servings: number;
  created_at: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type ProfileRow = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | null;
};

type RecipeIngredientRow = {
  recipe_id: string;
  position: number;
  quantity: string;
  name: string;
};

type RecipeStepRow = {
  recipe_id: string;
  position: number;
  body: string;
};

type RecipeTipRow = {
  recipe_id: string;
  position: number;
  body: string;
};

type RecipeImageRow = {
  recipe_id: string;
  position: number;
  url: string;
};

type RecipeCommentRow = {
  id: string;
  recipe_id: string;
  user_id: string;
  body: string;
  created_at: string;
  parent_id: string | null;
  is_pinned: boolean;
};

type RecipeInteractionRow = {
  recipe_id: string;
};

type RecipeSummary = Pick<
  Recipe,
  | 'id'
  | 'slug'
  | 'title'
  | 'description'
  | 'story'
  | 'imageId'
  | 'imageUrl'
  | 'imageHint'
  | 'coverPosition'
  | 'galleryImages'
  | 'reelUrl'
  | 'category'
  | 'prepTime'
  | 'cookTime'
  | 'servings'
  | 'likes'
  | 'favorites'
  | 'views'
  | 'createdAt'
  | 'author'
> & {
  isLiked: boolean;
  isFavorited: boolean;
  comments: Comment[];
  ingredients: Recipe['ingredients'];
  steps: string[];
  tips: string[];
};

type PublicRecipesData = {
  recipes: Recipe[];
  categories: Category[];
};

function fallbackData(): PublicRecipesData {
  return {
    recipes: mockRecipes,
    categories: mockCategories,
  };
}

function emptyData(): PublicRecipesData {
  return {
    recipes: [],
    categories: [],
  };
}

function buildUser(profile: ProfileRow | undefined): User {
  return {
    id: profile?.id || 'unknown-user',
    name: profile?.name?.trim() || 'Sui at home',
    avatarUrl: profile?.avatar_url || '',
    role: profile?.role || null,
  };
}

function mapSummaryRecipe(
  recipe: RecipeRow,
  categoriesById: Map<string, Category>,
  profilesById: Map<string, ProfileRow>,
  likeCounts: Map<string, number>,
  favoriteCounts: Map<string, number>,
  viewCounts: Map<string, number>,
  commentsByRecipeId: Map<string, Comment[]>,
  viewerLikedRecipeIds: Set<string>,
  viewerFavoritedRecipeIds: Set<string>
): RecipeSummary {
  return {
    id: recipe.id,
    slug: recipe.slug,
    title: recipe.title,
    description: recipe.description,
    story: recipe.story,
    imageId: '',
    imageUrl: recipe.image_url || undefined,
    imageHint: recipe.image_hint || undefined,
    coverPosition: recipe.cover_position || 'center center',
    reelUrl: recipe.reel_url || undefined,
    galleryImages: [],
    category: categoriesById.get(recipe.category_id) || {
      id: recipe.category_id,
      name: 'Uncategorized',
    },
    prepTime: recipe.prep_time,
    cookTime: recipe.cook_time,
    servings: recipe.servings,
    ingredients: [],
    steps: [],
    tips: [],
    likes: likeCounts.get(recipe.id) || 0,
    favorites: favoriteCounts.get(recipe.id) || 0,
    views: viewCounts.get(recipe.id) || 0,
    isLiked: viewerLikedRecipeIds.has(recipe.id),
    isFavorited: viewerFavoritedRecipeIds.has(recipe.id),
    comments: commentsByRecipeId.get(recipe.id) || [],
    createdAt: recipe.created_at,
    author: buildUser(profilesById.get(recipe.author_id)),
  };
}

async function getSupabaseRecipeData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewerId = user?.id ?? null;

  const [
    recipesResult,
    categoriesResult,
    profilesResult,
    ingredientsResult,
    stepsResult,
    tipsResult,
    recipeImagesResult,
    likesResult,
    favoritesResult,
    commentsResult,
    viewerLikesResult,
    viewerFavoritesResult,
    viewsResult,
  ] = await Promise.all([
    supabase
      .from('recipes')
      .select(
        'id, author_id, category_id, slug, title, description, story, image_url, image_hint, cover_position, reel_url, prep_time, cook_time, servings, created_at, is_hidden'
      )
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('id, name, slug').order('name', {
      ascending: true,
    }),
    supabase.from('profiles').select('id, name, avatar_url, role'),
    supabase
      .from('recipe_ingredients')
      .select('recipe_id, position, quantity, name')
      .order('position', { ascending: true }),
    supabase
      .from('recipe_steps')
      .select('recipe_id, position, body')
      .order('position', { ascending: true }),
    supabase
      .from('recipe_tips')
      .select('recipe_id, position, body')
      .order('position', { ascending: true }),
    supabase
      .from('recipe_images')
      .select('recipe_id, position, url')
      .order('position', { ascending: true }),
    supabase.from('recipe_likes').select('recipe_id'),
    supabase.from('recipe_favorites').select('recipe_id'),
    supabase
      .from('recipe_comments')
      .select('id, recipe_id, user_id, body, created_at, parent_id, is_pinned')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: true }),
    viewerId
      ? supabase.from('recipe_likes').select('recipe_id').eq('user_id', viewerId)
      : Promise.resolve({ data: [], error: null }),
    viewerId
      ? supabase
          .from('recipe_favorites')
          .select('recipe_id')
          .eq('user_id', viewerId)
      : Promise.resolve({ data: [], error: null }),
    supabase.from('recipe_views').select('recipe_id'),
  ]);

  if (recipesResult.error || !recipesResult.data) {
    return null;
  }

  // Filter out hidden recipes client-side so the query still works even if
  // the is_hidden column was not yet added to the DB (it would just be undefined).
  const recipeRows = (recipesResult.data as (RecipeRow & { is_hidden?: boolean })[]).filter(
    (r) => !r.is_hidden
  );
  const categoryRows = (categoriesResult.data as CategoryRow[]) ?? [];
  const profileRows = (profilesResult.data as ProfileRow[]) ?? [];
  const ingredientRows = (ingredientsResult.data as RecipeIngredientRow[]) ?? [];
  const stepRows = (stepsResult.data as RecipeStepRow[]) ?? [];
  const tipRows = (tipsResult.data as RecipeTipRow[]) ?? [];
  const recipeImageRows = (recipeImagesResult.data as RecipeImageRow[]) ?? [];
  const likeRows = (likesResult.data as RecipeInteractionRow[]) ?? [];
  const favoriteRows = (favoritesResult.data as RecipeInteractionRow[]) ?? [];
  const commentRows = (commentsResult.data as RecipeCommentRow[]) ?? [];
  const viewerLikeRows = (viewerLikesResult.data as RecipeInteractionRow[]) ?? [];
  const viewerFavoriteRows =
    (viewerFavoritesResult.data as RecipeInteractionRow[]) ?? [];
  const viewRows = (viewsResult.data as RecipeInteractionRow[]) ?? [];

  const categoriesById = new Map<string, Category>(
    categoryRows.map((category) => [
      category.id,
      { id: category.id, name: category.name },
    ])
  );
  const profilesById = new Map<string, ProfileRow>(
    profileRows.map((profile) => [profile.id, profile])
  );

  const commentUsersById = new Map<string, ProfileRow>(
    profileRows.map((profile) => [profile.id, profile])
  );
  const commentsByRecipeId = new Map<string, Comment[]>();
  // First pass: build all comment objects keyed by id
  const commentById = new Map<string, Comment>();
  commentRows.forEach((comment) => {
    commentById.set(comment.id, {
      id: comment.id,
      text: comment.body,
      user: buildUser(commentUsersById.get(comment.user_id)),
      createdAt: comment.created_at,
      replies: [],
      isPinned: comment.is_pinned,
    });
  });
  // Second pass: nest replies under parents, collect top-level per recipe
  commentRows.forEach((comment) => {
    const node = commentById.get(comment.id)!;
    if (comment.parent_id) {
      const parent = commentById.get(comment.parent_id);
      if (parent) {
        parent.replies.push(node);
      }
    } else {
      const bucket = commentsByRecipeId.get(comment.recipe_id) || [];
      bucket.push(node);
      commentsByRecipeId.set(comment.recipe_id, bucket);
    }
  });

  const likeCounts = new Map<string, number>();
  likeRows.forEach((row) => {
    likeCounts.set(row.recipe_id, (likeCounts.get(row.recipe_id) || 0) + 1);
  });

  const favoriteCounts = new Map<string, number>();
  favoriteRows.forEach((row) => {
    favoriteCounts.set(
      row.recipe_id,
      (favoriteCounts.get(row.recipe_id) || 0) + 1
    );
  });

  const viewCounts = new Map<string, number>();
  viewRows.forEach((row) => {
    viewCounts.set(row.recipe_id, (viewCounts.get(row.recipe_id) || 0) + 1);
  });

  const viewerLikedRecipeIds = new Set(
    viewerLikeRows.map((row) => row.recipe_id)
  );
  const viewerFavoritedRecipeIds = new Set(
    viewerFavoriteRows.map((row) => row.recipe_id)
  );

  const summaryRecipes = recipeRows.map((recipe) =>
    mapSummaryRecipe(
      recipe,
      categoriesById,
      profilesById,
      likeCounts,
      favoriteCounts,
      viewCounts,
      commentsByRecipeId,
      viewerLikedRecipeIds,
      viewerFavoritedRecipeIds
    )
  );

  const summaryRecipesById = new Map(summaryRecipes.map((recipe) => [recipe.id, recipe]));

  ingredientRows.forEach((ingredient) => {
    const recipe = summaryRecipesById.get(ingredient.recipe_id);
    if (!recipe) return;
    recipe.ingredients.push({
      quantity: ingredient.quantity,
      name: ingredient.name,
    });
  });

  stepRows.forEach((step) => {
    const recipe = summaryRecipesById.get(step.recipe_id);
    if (!recipe) return;
    recipe.steps.push(step.body);
  });

  tipRows.forEach((tip) => {
    const recipe = summaryRecipesById.get(tip.recipe_id);
    if (!recipe) return;
    recipe.tips.push(tip.body);
  });

  recipeImageRows.forEach((image) => {
    const recipe = summaryRecipesById.get(image.recipe_id);
    if (!recipe) return;
    recipe.galleryImages?.push({
      url: image.url,
      position: image.position,
    });
  });

  return {
    recipes: summaryRecipes,
    categories: categoryRows.map((category) => ({
      id: category.id,
      name: category.name,
    })),
  };
}

export async function getPublicRecipesData(): Promise<PublicRecipesData> {
  if (!hasSupabaseEnv()) {
    return fallbackData();
  }

  const supabaseData = await getSupabaseRecipeData();

  if (!supabaseData) {
    return emptyData();
  }

  return supabaseData;
}

export async function getHomepageRecipes() {
  const { recipes } = await getPublicRecipesData();
  const latestRecipes = [...recipes]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )
    .slice(0, 3);
  const popularRecipes = [...recipes]
    .sort((left, right) => {
      if (right.views !== left.views) {
        return right.views - left.views;
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    })
    .slice(0, 10);

  return { latestRecipes, popularRecipes };
}

export async function getPublicRecipeByIdentifier(identifier: string) {
  const { recipes } = await getPublicRecipesData();
  return recipes.find(
    (recipe) => recipe.id === identifier || recipe.slug === identifier
  );
}

export async function getRelatedPublicRecipes(recipe: Recipe, count: number) {
  const { recipes } = await getPublicRecipesData();
  const relatedByCategory = recipes.filter(
    (candidate) =>
      candidate.category.id === recipe.category.id && candidate.id !== recipe.id
  );

  if (relatedByCategory.length >= count) {
    return relatedByCategory
      .sort((left, right) => right.likes - left.likes)
      .slice(0, count);
  }

  const otherRecipes = recipes
    .filter(
      (candidate) =>
        candidate.id !== recipe.id &&
        !relatedByCategory.some((related) => related.id === candidate.id)
    )
    .sort((left, right) => right.likes - left.likes);

  return [...relatedByCategory, ...otherRecipes].slice(0, count);
}
