import { notFound, redirect } from 'next/navigation';

import { getAuthContext } from '@/lib/supabase/auth';
import {
  getAdminCategories,
  getAdminRecipeForEdit,
} from '@/lib/supabase/admin';
import { hasSupabaseEnv } from '@/lib/supabase/config';

import { NewRecipeForm } from '../../new/recipe-form';

type EditRecipePageProps = {
  params: Promise<{
    recipeId: string;
  }>;
};

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  if (!hasSupabaseEnv()) {
    redirect('/login?error=Add%20your%20Supabase%20env%20vars%20first.');
  }

  const authContext = await getAuthContext();

  if (!authContext.isLoggedIn) {
    redirect('/login?next=/admin/recipes');
  }

  if (!authContext.isAdmin) {
    notFound();
  }

  const { recipeId } = await params;
  const [categories, recipe] = await Promise.all([
    getAdminCategories(),
    getAdminRecipeForEdit(recipeId),
  ]);

  if (!recipe) {
    notFound();
  }

  return (
    <NewRecipeForm
      categories={categories}
      initialRecipe={recipe}
      mode="edit"
    />
  );
}
