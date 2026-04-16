'use server';

import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { AdminNav } from '@/components/layout/admin-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAuthContext } from '@/lib/supabase/auth';
import { getCategoriesWithRecipeCount, deleteCategory } from '@/lib/supabase/admin';
import { hasSupabaseEnv } from '@/lib/supabase/config';

async function deleteCategoryAction(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  if (!id) return;
  await deleteCategory(id);
  revalidatePath('/admin/categories');
}

export default async function AdminCategoriesPage() {
  if (!hasSupabaseEnv()) {
    redirect('/login?error=Add%20your%20Supabase%20env%20vars%20first.');
  }

  const authContext = await getAuthContext();
  if (!authContext.isLoggedIn) redirect('/login?next=/admin/categories');
  if (!authContext.isAdmin) notFound();

  const categories = await getCategoriesWithRecipeCount();

  return (
    <div className="py-8 md:py-12">
      <section className="mx-auto max-w-4xl">
        <div className="space-y-3 mb-6">
          <Badge variant="secondary">Admin</Badge>
          <h1 className="font-headline text-3xl sm:text-4xl">Manage Categories</h1>
          <p className="text-muted-foreground">
            Categories with 0 recipes can be deleted. Categories in use are protected.
          </p>
        </div>

        <AdminNav />

        <div className="mt-8 border-2 border-foreground bg-paper paper-shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground bg-muted">
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Slug</th>
                <th className="text-center px-4 py-3 font-semibold">Recipes</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr
                  key={cat.id}
                  className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                >
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={cat.recipeCount === 0 ? 'outline' : 'secondary'}>
                      {cat.recipeCount}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {cat.recipeCount === 0 ? (
                      <form action={deleteCategoryAction}>
                        <input type="hidden" name="id" value={cat.id} />
                        <Button
                          type="submit"
                          variant="destructive"
                          size="sm"
                          className="border-2 border-foreground"
                        >
                          Delete
                        </Button>
                      </form>
                    ) : (
                      <span className="text-xs text-muted-foreground">In use</span>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
