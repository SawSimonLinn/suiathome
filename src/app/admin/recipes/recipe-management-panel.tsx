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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type SortKey = 'newest' | 'oldest' | 'most-views' | 'most-likes' | 'most-favorites';

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
    switch (sort) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'most-views':
        return b.views - a.views;
      case 'most-likes':
        return b.likes - a.likes;
      case 'most-favorites':
        return b.favorites - a.favorites;
    }
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

  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
      promise,
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
        const { error } = await withTimeout(
          supabase.from('recipes').delete().eq('id', recipe.id),
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
        const { error } = await withTimeout(
          supabase.from('recipes').update({ is_hidden: isHidden }).eq('id', recipe.id),
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
        <CardHeader>
          <CardTitle>Uploaded Recipes</CardTitle>
          <CardDescription>
            Search, filter, and manage recipes. Hidden recipes stay in the database
            but are removed from the public page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Action failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {/* Search + Sort controls */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search by title or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="most-views">Most views</SelectItem>
                <SelectItem value="most-likes">Most likes</SelectItem>
                <SelectItem value="most-favorites">Most favorites</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead className="hidden lg:table-cell text-right">Views</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Likes</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayed.length > 0 ? (
                  displayed.map((recipe) => (
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
                      <TableCell className="hidden lg:table-cell text-right tabular-nums text-muted-foreground">
                        {recipe.views.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right tabular-nums text-muted-foreground">
                        {recipe.likes.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatDate(recipe.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
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
