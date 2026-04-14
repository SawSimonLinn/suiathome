import { notFound, redirect } from 'next/navigation';

import { getAuthContext } from '@/lib/supabase/auth';
import { getAdminCategories } from '@/lib/supabase/admin';
import { hasSupabaseEnv } from '@/lib/supabase/config';

import { NewRecipeForm } from './recipe-form';

export default async function NewRecipePage() {
  if (!hasSupabaseEnv()) {
    redirect('/login?error=Add%20your%20Supabase%20env%20vars%20first.');
  }

  const authContext = await getAuthContext();

  if (!authContext.isLoggedIn) {
    redirect('/login?next=/admin/recipes/new');
  }

  if (!authContext.isAdmin) {
    notFound();
  }

  const categories = await getAdminCategories();

  return <NewRecipeForm categories={categories} />;
}
