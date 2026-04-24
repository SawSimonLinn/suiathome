'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createClient } from '@/lib/supabase/client';
import type { AdminRecipeListItem } from '@/lib/supabase/admin';

type SortKey = 'newest' | 'oldest' | 'most-views';

type ConfirmAction =
  | { kind: 'delete'; recipe: AdminRecipeListItem }
  | { kind: 'hide'; recipe: AdminRecipeListItem }
  | { kind: 'unhide'; recipe: AdminRecipeListItem }
  | null;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function sortRecipes(recipes: AdminRecipeListItem[], sort: SortKey) {
  return [...recipes].sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return b.views - a.views;
  });
}

export function RecipeManagementPanel({
  initialRecipes,
}: {
  initialRecipes: AdminRecipeListItem[];
}) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? recipes.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.categoryName.toLowerCase().includes(q)
        )
      : recipes;
    return sortRecipes(filtered, sort);
  }, [recipes, search, sort]);

  const totalPages = Math.ceil(displayed.length / 10);
  const pageRecipes = displayed.slice(page * 10, (page + 1) * 10);

  const withTimeout = <T,>(promise: PromiseLike<T>, ms: number): Promise<T> =>
    Promise.race([
      Promise.resolve(promise),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out after ${ms / 1000}s. Check your Supabase RLS policies.`)), ms)
      ),
    ]);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { recipe } = confirmAction;
    setBusyId(recipe.id);
    setDialogError(null);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      if (confirmAction.kind === 'delete') {
        const { error } = await withTimeout<{ error: { message: string } | null }>(
          supabase.from('recipes').delete().eq('id', recipe.id) as PromiseLike<{ error: { message: string } | null }>,
          8000
        );
        if (error) {
          setDialogError(error.message);
          return;
        }
        setRecipes((current) => current.filter((r) => r.id !== recipe.id));
        setConfirmAction(null);
      } else {
        const isHidden = confirmAction.kind === 'hide';
        const { error } = await withTimeout<{ error: { message: string } | null }>(
          supabase.from('recipes').update({ is_hidden: isHidden }).eq('id', recipe.id) as PromiseLike<{ error: { message: string } | null }>,
          8000
        );
        if (error) {
          setDialogError(error.message);
          return;
        }
        setRecipes((current) =>
          current.map((r) => r.id === recipe.id ? { ...r, isHidden } : r)
        );
        setConfirmAction(null);
      }
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmConfig = confirmAction
    ? confirmAction.kind === 'delete'
      ? {
          title: 'Delete recipe?',
          description: `"${confirmAction.recipe.title}" will be permanently removed. This cannot be undone.`,
          label: 'Delete',
          destructive: true,
        }
      : confirmAction.kind === 'hide'
      ? {
          title: 'Hide recipe?',
          description: `"${confirmAction.recipe.title}" will be hidden from the public recipes page.`,
          label: 'Hide',
          destructive: false,
        }
      : {
          title: 'Make recipe visible?',
          description: `"${confirmAction.recipe.title}" will become visible on the public recipes page.`,
          label: 'Unhide',
          destructive: false,
        }
    : null;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Uploaded Recipes</CardTitle>
            <CardDescription>
              Search, filter, and manage recipes.
            </CardDescription>
          </div>
          <div className="flex w-full overflow-hidden rounded-md border border-input sm:w-auto sm:shrink-0">
            {(['newest', 'oldest', 'most-views'] as const).map((key, i) => (
              <button
                key={key}
                onClick={() => { setSort(key); setPage(0); }}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors sm:flex-none sm:px-3 ${i > 0 ? 'border-l border-input' : ''} ${sort === key ? 'bg-foreground text-background' : 'bg-background text-muted-foreground hover:text-foreground'}`}
              >
                {key === 'newest' ? 'Newest' : key === 'oldest' ? 'Oldest' : 'Most Views'}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Action failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search by title or category…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="sm:max-w-xs"
            />
            <span className="text-sm text-muted-foreground sm:ml-auto">
              {displayed.length} of {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Likes</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRecipes.length > 0 ? (
                  pageRecipes.map((recipe) => (
                    <TableRow key={recipe.id} className={recipe.isHidden ? 'opacity-50' : ''}>
                      <TableCell className="font-medium max-w-[140px] truncate">
                        {recipe.title}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {recipe.categoryName}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={recipe.isHidden ? 'secondary' : 'outline'}>
                          {recipe.isHidden ? 'Hidden' : 'Visible'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {recipe.views.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right tabular-nums text-muted-foreground">
                        {recipe.likes.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatDate(recipe.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busyId === recipe.id}
                            >
                              {busyId === recipe.id ? 'Saving…' : 'Actions'}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/recipes/${recipe.id}/edit`}>
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/recipes/${recipe.id}`} target="_blank">
                                View Live
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {recipe.isHidden ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  setConfirmAction({ kind: 'unhide', recipe })
                                }
                              >
                                Unhide
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  setConfirmAction({ kind: 'hide', recipe })
                                }
                              >
                                Hide
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                setConfirmAction({ kind: 'delete', recipe })
                              }
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      {search ? `No recipes match "${search}".` : 'No uploaded recipes yet.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
            setDialogError(null);
          }
        }}
      >
        <DialogContent>
          {confirmConfig ? (
            <>
              <DialogHeader>
                <DialogTitle>{confirmConfig.title}</DialogTitle>
                <DialogDescription>{confirmConfig.description}</DialogDescription>
              </DialogHeader>

              {dialogError ? (
                <Alert variant="destructive">
                  <AlertTitle>Action failed</AlertTitle>
                  <AlertDescription>{dialogError}</AlertDescription>
                </Alert>
              ) : null}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => { setConfirmAction(null); setDialogError(null); }}
                  disabled={busyId !== null}
                >
                  Cancel
                </Button>
                <Button
                  variant={confirmConfig.destructive ? 'destructive' : 'default'}
                  onClick={handleConfirm}
                  disabled={busyId !== null}
                >
                  {busyId !== null ? 'Saving…' : confirmConfig.label}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
