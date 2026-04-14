'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { UserRoleBadge } from '@/components/user-role-badge';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import type { Comment, User } from '@/lib/types';

type RecipeQaSectionProps = {
  recipeId: string;
  initialComments: Comment[];
  currentUser: User | null;
};

function formatPostedDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

export function RecipeQaSection({
  recipeId,
  initialComments,
  currentUser,
}: RecipeQaSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser) {
      setErrorMessage('Sign in to ask a question or leave a note.');
      return;
    }

    if (!commentText.trim()) {
      setErrorMessage('Write a message before posting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data: insertedComment, error } = await supabase
        .from('recipe_comments')
        .insert({
          recipe_id: recipeId,
          user_id: currentUser.id,
          body: commentText.trim(),
        })
        .select('id, body, created_at')
        .single<{
          id: string;
          body: string;
          created_at: string;
        }>();

      if (error || !insertedComment) {
        setErrorMessage(error?.message || 'Could not post your message.');
        return;
      }

      setComments((current) => [
        ...current,
        {
          id: insertedComment.id,
          text: insertedComment.body,
          user: currentUser,
          createdAt: insertedComment.created_at,
        },
      ]);
      setCommentText('');
      router.refresh();
      toast({
        title: 'Posted to recipe Q&A',
        description: 'Your question or tip is now visible on this recipe.',
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not post your message.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto mt-16">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl">
            Recipe Q&amp;A
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ask questions, share substitutions, or leave helpful notes for the
            next person making this dish.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border bg-secondary/20 p-4 shadow-paper-sm"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={comment.user.avatarUrl}
                        alt={comment.user.name}
                      />
                      <AvatarFallback>
                        {comment.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{comment.user.name}</p>
                        <UserRoleBadge user={comment.user} />
                        <p className="text-xs text-muted-foreground">
                          {formatPostedDate(comment.createdAt)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-foreground/90">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No questions yet. Be the first to ask or share a tip.
              </div>
            )}
          </div>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            {errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}
            <Textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder={
                currentUser
                  ? 'Ask a question or share a helpful note...'
                  : 'Sign in to join the recipe Q&A.'
              }
              disabled={!currentUser || isSubmitting}
              rows={4}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!currentUser || isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post to Q&A'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
