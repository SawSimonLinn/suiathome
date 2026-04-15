import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { AdminNav } from '@/components/layout/admin-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAuthContext } from '@/lib/supabase/auth';
import { getAdminRecipeList } from '@/lib/supabase/admin';
import { hasSupabaseEnv } from '@/lib/supabase/config';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

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
            <h1 className="font-headline text-4xl md:text-5xl">
              Edit Uploaded Recipes
            </h1>
            <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
              Open any uploaded recipe, review the current content, and make changes
              without creating a duplicate recipe entry.
            </p>
          </div>
        </div>

        <AdminNav />

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Recipes</CardTitle>
            <CardDescription>
              Choose a recipe to edit, or open the public page to review it live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Slug</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipes.length > 0 ? (
                  recipes.map((recipe) => (
                    <TableRow key={recipe.id}>
                      <TableCell className="font-medium max-w-[140px] truncate">{recipe.title}</TableCell>
                      <TableCell className="hidden sm:table-cell">{recipe.categoryName}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground max-w-[160px] truncate">
                        /{recipe.slug}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(recipe.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm">
                            <Link href={`/admin/recipes/${recipe.id}/edit`}>Edit</Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                            <Link href={`/recipes/${recipe.slug}`}>View Live</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No uploaded recipes yet. Create your first one from the upload page.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
