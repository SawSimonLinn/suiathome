'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

type RecipeInteractionKind = 'like' | 'save' | 'favorite';
type RecipeInteractionTable =
  | 'recipe_likes'
  | 'recipe_saves'
  | 'recipe_favorites';

type UseRecipeInteractionsOptions = {
  recipeId: string;
  initialLikeCount: number;
  initialFavoriteCount: number;
  initialLiked: boolean;
  initialSaved: boolean;
  initialFavorited: boolean;
};

type ToggleOptions = {
  action: RecipeInteractionKind;
  table: RecipeInteractionTable;
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  adjustCount?: React.Dispatch<React.SetStateAction<number>>;
};

export function useRecipeInteractions({
  recipeId,
  initialLikeCount,
  initialFavoriteCount,
  initialLiked,
  initialSaved,
  initialFavorited,
}: UseRecipeInteractionsOptions) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] =
    useState<RecipeInteractionKind | null>(null);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);

  async function toggleInteraction({
    action,
    table,
    active,
    setActive,
    adjustCount,
  }: ToggleOptions) {
    let supabase;

    try {
      supabase = createClient();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Supabase is not configured',
        description:
          error instanceof Error
            ? error.message
            : 'Add your Supabase URL and publishable key first.',
      });
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast({
        variant: 'destructive',
        title: 'Sign in required',
        description: 'Log in to like, save, and favorite recipes.',
      });
      return;
    }

    setPendingAction(action);
    const previousActive = active;

    setActive(!active);
    if (adjustCount) {
      adjustCount((count) => count + (active ? -1 : 1));
    }

    const query = active
      ? supabase
          .from(table)
          .delete()
          .eq('recipe_id', recipeId)
          .eq('user_id', user.id)
      : supabase.from(table).insert({
          recipe_id: recipeId,
          user_id: user.id,
        });

    const { error } = await query;

    if (error) {
      setActive(previousActive);
      if (adjustCount) {
        adjustCount((count) => count + (previousActive ? 1 : -1));
      }

      toast({
        variant: 'destructive',
        title: `Could not ${action} recipe`,
        description: error.message,
      });
      setPendingAction(null);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
    setPendingAction(null);
  }

  return {
    isLiked,
    isSaved,
    isFavorited,
    likeCount,
    favoriteCount,
    isRefreshing: isPending,
    pendingAction,
    toggleLike: () =>
      toggleInteraction({
        action: 'like',
        table: 'recipe_likes',
        active: isLiked,
        setActive: setIsLiked,
        adjustCount: setLikeCount,
      }),
    toggleSave: () =>
      toggleInteraction({
        action: 'save',
        table: 'recipe_saves',
        active: isSaved,
        setActive: setIsSaved,
      }),
    toggleFavorite: () =>
      toggleInteraction({
        action: 'favorite',
        table: 'recipe_favorites',
        active: isFavorited,
        setActive: setIsFavorited,
        adjustCount: setFavoriteCount,
      }),
  };
}
