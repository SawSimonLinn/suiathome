'use client';

import { useState } from 'react';

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

type CommentModerationPanelProps = {
  recipeComments: ModerationComment[];
  communityComments: ModerationComment[];
  hiddenModerationReady: boolean;
};

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

  const handleDelete = async (kind: 'recipe' | 'community', id: string) => {
    const tableName =
      kind === 'recipe' ? 'recipe_comments' : 'community_post_comments';
    const key = `${kind}:${id}:delete`;

    setBusyKey(key);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from(tableName).delete().eq('id', id);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (kind === 'recipe') {
        setRecipeState((current) => current.filter((comment) => comment.id !== id));
      } else {
        setCommunityState((current) =>
          current.filter((comment) => comment.id !== id)
        );
      }
    } finally {
      setBusyKey(null);
    }
  };

  const handleVisibilityToggle = async (
    kind: 'recipe' | 'community',
    comment: ModerationComment
  ) => {
    if (!hiddenModerationReady) {
      setErrorMessage(
        'Run docs/supabase-admin-upgrade.sql first to enable hidden comment controls.'
      );
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

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const updater = (current: ModerationComment[]) =>
        current.map((item) =>
          item.id === comment.id ? { ...item, isHidden: !item.isHidden } : item
        );

      if (kind === 'recipe') {
        setRecipeState(updater);
      } else {
        setCommunityState(updater);
      }
    } finally {
      setBusyKey(null);
    }
  };

  const renderTable = (
    comments: ModerationComment[],
    kind: 'recipe' | 'community',
    emptyLabel: string
  ) => (
    <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Author</TableHead>
          <TableHead className="hidden sm:table-cell">Target</TableHead>
          <TableHead>Comment</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="hidden lg:table-cell">Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell className="font-medium whitespace-nowrap">{comment.userName}</TableCell>
              <TableCell className="hidden sm:table-cell max-w-[160px] truncate">
                {comment.parentLabel}
              </TableCell>
              <TableCell className="max-w-[200px] sm:max-w-[280px] whitespace-normal text-sm text-muted-foreground">
                {comment.body}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant={comment.isHidden ? 'secondary' : 'outline'}>
                  {comment.isHidden ? 'Hidden' : 'Visible'}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell whitespace-nowrap">{formatTimestamp(comment.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 sm:gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    asChild
                  >
                    <a
                      href={
                        kind === 'recipe'
                          ? `/recipes/${comment.parentSlug ?? comment.parentId}`
                          : `/community/${comment.parentId}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Post
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      busyKey === `${kind}:${comment.id}:toggle` ||
                      !hiddenModerationReady
                    }
                    onClick={() => handleVisibilityToggle(kind, comment)}
                  >
                    {busyKey === `${kind}:${comment.id}:toggle`
                      ? 'Saving...'
                      : comment.isHidden
                        ? 'Unhide'
                        : 'Hide'}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={busyKey === `${kind}:${comment.id}:delete`}
                    onClick={() => handleDelete(kind, comment.id)}
                  >
                    {busyKey === `${kind}:${comment.id}:delete`
                      ? 'Deleting...'
                      : 'Delete'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-muted-foreground">
              {emptyLabel}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comment Moderation Queue</CardTitle>
        <CardDescription>
          Switch between recipe comments and community comments. Hide is reversible.
          Delete is permanent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hiddenModerationReady ? (
          <Alert>
            <AlertTitle>Hide/Unhide setup is not active yet</AlertTitle>
            <AlertDescription>
              Delete still works once your admin policies are in place, but hide
              controls need the `is_hidden` columns from
              {' '}
              `docs/supabase-admin-upgrade.sql`.
            </AlertDescription>
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Moderation action failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <Tabs defaultValue="recipe">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recipe">
              Recipe Comments ({recipeState.length})
            </TabsTrigger>
            <TabsTrigger value="community">
              Community Comments ({communityState.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="recipe">
            {renderTable(
              recipeState,
              'recipe',
              'No recipe comments are in the moderation queue yet.'
            )}
          </TabsContent>
          <TabsContent value="community">
            {renderTable(
              communityState,
              'community',
              'No community comments are in the moderation queue yet.'
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
