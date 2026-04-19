import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { AdminNav } from '@/components/layout/admin-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary">Admin</Badge>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl">
              Recipes
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Upload new recipes or edit, hide, and delete existing ones.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/admin/recipes/new">+ Upload Recipe</Link>
          </Button>
        </div>

        <AdminNav />

        <RecipeManagementPanel initialRecipes={recipes} />
      </div>
    </div>
  );
}
