import { notFound, redirect } from 'next/navigation';

import { AdminNav } from '@/components/layout/admin-nav';
import { Badge } from '@/components/ui/badge';
import { getAuthContext } from '@/lib/supabase/auth';
import { getAdminRecipeList } from '@/lib/supabase/admin';
import { hasSupabaseEnv } from '@/lib/supabase/config';
import { RecipeManagementPanel } from './recipe-management-panel';

export default async function AdminRecipesPage() {
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

  const recipes = await getAdminRecipeList();

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-3">
          <Badge variant="secondary">Admin Recipe Library</Badge>
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl">
              Manage Recipes
            </h1>
            <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
              Edit, hide, or delete uploaded recipes. Hidden recipes are removed
              from the public page but stay in your database.
            </p>
          </div>
        </div>

        <AdminNav />

        <RecipeManagementPanel initialRecipes={recipes} />
      </div>
    </div>
  );
}
