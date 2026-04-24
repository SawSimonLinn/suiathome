'use client';

import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ModerationComment } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';

const PAGE_SIZE = 10;

type CommentModerationPanelProps = {
  recipeComments: ModerationComment[];
  communityComments: ModerationComment[];
  hiddenModerationReady: boolean;
};

type Pending = { kind: 'recipe' | 'community'; comment: ModerationComment };

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function CommentModerationPanel({
  recipeComments,
  communityComments,
  hiddenModerationReady,
}: CommentModerationPanelProps) {
  const [recipeState, setRecipeState] = useState(recipeComments);
  const [communityState, setCommunityState] = useState(communityComments);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [recipeSearch, setRecipeSearch] = useState('');
  const [communitySearch, setCommunitySearch] = useState('');
  const [recipePage, setRecipePage] = useState(1);
  const [communityPage, setCommunityPage] = useState(1);

  // Confirmation modal state
  const [pendingHide, setPendingHide] = useState<Pending | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Pending | null>(null);
  const [deleteInput, setDeleteInput] = useState('');

  const handleDelete = async (kind: 'recipe' | 'community', id: string) => {
    const tableName =
      kind === 'recipe' ? 'recipe_comments' : 'community_post_comments';
    const key = `${kind}:${id}:delete`;
    setBusyKey(key);
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) { setErrorMessage(error.message); return; }
      if (kind === 'recipe') {
        setRecipeState((c) => c.filter((x) => x.id !== id));
      } else {
        setCommunityState((c) => c.filter((x) => x.id !== id));
      }
    } finally {
      setBusyKey(null);
      setPendingDelete(null);
      setDeleteInput('');
    }
  };

  const handleVisibilityToggle = async (
    kind: 'recipe' | 'community',
    comment: ModerationComment
  ) => {
    if (!hiddenModerationReady) {
      setErrorMessage('Run docs/supabase-admin-upgrade.sql first to enable hidden comment controls.');
      return;
    }
    const tableName =
      kind === 'recipe' ? 'recipe_comments' : 'community_post_comments';
    const key = `${kind}:${comment.id}:toggle`;
    setBusyKey(key);
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from(tableName)
        .update({ is_hidden: !comment.isHidden })
        .eq('id', comment.id);
      if (error) { setErrorMessage(error.message); return; }
      const updater = (current: ModerationComment[]) =>
        current.map((item) =>
          item.id === comment.id ? { ...item, isHidden: !item.isHidden } : item
        );
      if (kind === 'recipe') { setRecipeState(updater); } else { setCommunityState(updater); }
    } finally {
      setBusyKey(null);
      setPendingHide(null);
    }
  };

  const postHref = (kind: 'recipe' | 'community', comment: ModerationComment) =>
    kind === 'recipe'
      ? `/recipes/${comment.parentSlug ?? comment.parentId}`
      : `/community/${comment.parentId}`;

  // Mobile card buttons
  const renderActions = (kind: 'recipe' | 'community', comment: ModerationComment) => (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" size="sm" asChild>
        <a href={postHref(kind, comment)} target="_blank" rel="noopener noreferrer">
          View Post
        </a>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!hiddenModerationReady}
        onClick={() => setPendingHide({ kind, comment })}
      >
        {comment.isHidden ? 'Unhide' : 'Hide'}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => { setPendingDelete({ kind, comment }); setDeleteInput(''); }}
      >
        Delete
      </Button>
    </div>
  );

  const renderContent = (
    comments: ModerationComment[],
    kind: 'recipe' | 'community',
    emptyLabel: string,
    search: string,
    setSearch: (v: string) => void,
    page: number,
    setPage: (v: number) => void
  ) => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? comments.filter(
          (c) =>
            c.body.toLowerCase().includes(q) ||
            c.userName.toLowerCase().includes(q) ||
            c.parentLabel.toLowerCase().includes(q)
        )
      : comments;

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return (
      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Filter by author, comment, or post…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:max-w-sm"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {search && (
              <Button type="button" variant="ghost" size="sm"
                onClick={() => { setSearch(''); setPage(1); }}>
                Clear
              </Button>
            )}
            <span className="text-sm text-muted-foreground ml-auto sm:ml-0">
              {filtered.length} comment{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Mobile: card list */}
        <div className="sm:hidden space-y-3">
          {paginated.length > 0 ? (
            paginated.map((comment) => (
              <div key={comment.id} className="rounded-lg border bg-card p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold truncate">{comment.userName}</span>
                  <Badge variant={comment.isHidden ? 'secondary' : 'outline'} className="shrink-0">
                    {comment.isHidden ? 'Hidden' : 'Visible'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  <span className="font-medium text-foreground">Post: </span>
                  {comment.parentLabel}
                </p>
                <p className="text-muted-foreground line-clamp-3">{comment.body}</p>
                <p className="text-xs text-muted-foreground">{formatTimestamp(comment.createdAt)}</p>
                {renderActions(kind, comment)}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {q ? 'No comments match your filter.' : emptyLabel}
            </p>
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Post</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {comment.userName}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate">
                      {comment.parentLabel}
                    </TableCell>
                    <TableCell className="max-w-[280px] whitespace-normal text-sm text-muted-foreground">
                      {comment.body}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={comment.isHidden ? 'secondary' : 'outline'}>
                        {comment.isHidden ? 'Hidden' : 'Visible'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">
                      {formatTimestamp(comment.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" size="sm" asChild>
                          <a href={postHref(kind, comment)} target="_blank" rel="noopener noreferrer">
                            View Post
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!hiddenModerationReady}
                          onClick={() => setPendingHide({ kind, comment })}
                        >
                          {comment.isHidden ? 'Unhide' : 'Hide'}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => { setPendingDelete({ kind, comment }); setDeleteInput(''); }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    {q ? 'No comments match your filter.' : emptyLabel}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <Button type="button" variant="outline" size="sm"
              disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {safePage} of {totalPages}
            </span>
            <Button type="button" variant="outline" size="sm"
              disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Comment Moderation Queue</CardTitle>
          <CardDescription>
            Switch between recipe comments and community comments. Hide is reversible.
            Delete is permanent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hiddenModerationReady && (
            <Alert>
              <AlertTitle>Hide/Unhide setup is not active yet</AlertTitle>
              <AlertDescription>
                Delete still works once your admin policies are in place, but hide
                controls need the `is_hidden` columns from `docs/supabase-admin-upgrade.sql`.
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Moderation action failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="recipe">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recipe" className="text-xs sm:text-sm">
                <span className="sm:hidden">Recipes ({recipeState.length})</span>
                <span className="hidden sm:inline">Recipe Comments ({recipeState.length})</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="text-xs sm:text-sm">
                <span className="sm:hidden">Community ({communityState.length})</span>
                <span className="hidden sm:inline">Community Comments ({communityState.length})</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="recipe">
              {renderContent(
                recipeState, 'recipe',
                'No recipe comments are in the moderation queue yet.',
                recipeSearch, setRecipeSearch, recipePage, setRecipePage
              )}
            </TabsContent>
            <TabsContent value="community">
              {renderContent(
                communityState, 'community',
                'No community comments are in the moderation queue yet.',
                communitySearch, setCommunitySearch, communityPage, setCommunityPage
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Hide confirmation */}
      <AlertDialog open={!!pendingHide} onOpenChange={(open) => { if (!open) setPendingHide(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingHide?.comment.isHidden ? 'Unhide this comment?' : 'Hide this comment?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingHide?.comment.isHidden
                ? 'This comment will become visible to the public again.'
                : 'This comment will be hidden from public views. You can unhide it at any time.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!busyKey}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!!busyKey}
              onClick={() => {
                if (pendingHide) handleVisibilityToggle(pendingHide.kind, pendingHide.comment);
              }}
            >
              {busyKey ? 'Saving…' : pendingHide?.comment.isHidden ? 'Yes, unhide' : 'Yes, hide'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation — requires typing "delete" */}
      <Dialog open={!!pendingDelete} onOpenChange={(open) => {
        if (!open) { setPendingDelete(null); setDeleteInput(''); }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this comment?</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. Type{' '}
              <span className="font-semibold text-foreground">delete</span>{' '}
              below to confirm.
            </DialogDescription>
          </DialogHeader>

          {pendingDelete && (
            <blockquote className="border-l-2 pl-3 text-sm text-muted-foreground italic line-clamp-3">
              {pendingDelete.comment.body}
            </blockquote>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="delete-confirm">Confirmation</Label>
            <Input
              id="delete-confirm"
              placeholder='Type "delete" to confirm'
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={!!busyKey}
              onClick={() => { setPendingDelete(null); setDeleteInput(''); }}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteInput !== 'delete' || !!busyKey}
              onClick={() => {
                if (pendingDelete) handleDelete(pendingDelete.kind, pendingDelete.comment.id);
              }}
            >
              {busyKey ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
