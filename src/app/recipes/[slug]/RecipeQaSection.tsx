'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

type CommentItemProps = {
  comment: Comment;
  currentUser: User | null;
  recipeId: string;
  onReplyAdded: (parentId: string, reply: Comment) => void;
  onDeleted: (commentId: string, parentId?: string) => void;
  onEdited: (commentId: string, newText: string, parentId?: string) => void;
  onPinToggled: (commentId: string, pinned: boolean) => void;
  parentId?: string;
  depth?: number;
};

function CommentItem({
  comment,
  currentUser,
  recipeId,
  onReplyAdded,
  onDeleted,
  onEdited,
  onPinToggled,
  parentId,
  depth = 0,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const replies = comment.replies ?? [];
  const replyCount = replies.length;
  const isOwner = currentUser?.id === comment.user.id;
  const isAdmin = currentUser?.role === 'admin';

  const handleToggleReplyForm = () => {
    if (!showReplyForm) {
      setReplyText(`@${comment.user.name} `);
      setShowReplyForm(true);
      setTimeout(() => replyTextareaRef.current?.focus(), 0);
    } else {
      setShowReplyForm(false);
      setReplyText('');
      setErrorMessage(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('recipe_comments')
      .delete()
      .eq('id', comment.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    onDeleted(comment.id, parentId);
    toast({ title: 'Comment deleted' });
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('recipe_comments')
      .update({ body: editText.trim() })
      .eq('id', comment.id);
    setIsSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    onEdited(comment.id, editText.trim(), parentId);
    setIsEditMode(false);
    toast({ title: 'Comment updated' });
  };

  const handlePinToggle = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from('recipe_comments')
      .update({ is_pinned: !comment.isPinned })
      .eq('id', comment.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    onPinToggled(comment.id, !comment.isPinned);
    toast({ title: comment.isPinned ? 'Comment unpinned' : 'Comment pinned' });
  };

  const handleSubmitReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) return;
    if (!replyText.trim()) {
      setErrorMessage('Write a reply before posting.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const { data: inserted, error } = await supabase
        .from('recipe_comments')
        .insert({
          recipe_id: recipeId,
          user_id: currentUser.id,
          body: replyText.trim(),
          parent_id: comment.id,
        })
        .select('id, body, created_at')
        .single<{ id: string; body: string; created_at: string }>();

      if (error || !inserted) {
        setErrorMessage(error?.message || 'Could not post your reply.');
        return;
      }

      onReplyAdded(comment.id, {
        id: inserted.id,
        text: inserted.body,
        user: currentUser,
        createdAt: inserted.created_at,
        replies: [],
      });
      setReplyText('');
      setShowReplyForm(false);
      setShowReplies(true);
      toast({ title: 'Reply posted' });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not post your reply.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div
        className={`border-2 bg-paper p-4 paper-shadow-sm ${
          comment.isPinned ? 'border-primary' : 'border-foreground'
        } ${depth > 0 ? 'ml-8 mt-2' : ''}`}
      >
        {comment.isPinned && (
          <p className="mb-2 text-xs font-semibold text-primary">📌 Pinned</p>
        )}

        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
            <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            {/* Name row + menu */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/profile/${comment.user.id}`} className="font-medium hover:underline">
                  {comment.user.name}
                </Link>
                <UserRoleBadge user={comment.user} />
                <p className="text-xs text-muted-foreground">
                  {formatPostedDate(comment.createdAt)}
                </p>
              </div>

              {(isOwner || isAdmin) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors px-1 leading-none text-lg"
                      aria-label="Comment options"
                    >
                      •••
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-36">
                    {isOwner && (
                      <DropdownMenuItem onClick={() => setIsEditMode(true)}>
                        Edit
                      </DropdownMenuItem>
                    )}
                    {isAdmin && depth === 0 && (
                      <DropdownMenuItem onClick={handlePinToggle}>
                        {comment.isPinned ? 'Unpin' : 'Pin'}
                      </DropdownMenuItem>
                    )}
                    {(isOwner || isAdmin) && <DropdownMenuSeparator />}
                    {(isOwner || isAdmin) && (
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditMode ? (
              <div className="mt-2 grid gap-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => { setIsEditMode(false); setEditText(comment.text); }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" size="sm" disabled={isSubmitting} onClick={handleEdit}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm text-foreground/90">{comment.text}</p>
            )}

            {/* Reply / show-replies row */}
            {!isEditMode && (
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {currentUser && depth === 0 && (
                  <button
                    type="button"
                    onClick={handleToggleReplyForm}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showReplyForm ? 'Cancel reply' : '↩ Reply'}
                  </button>
                )}
                {replyCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowReplies((v) => !v)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showReplies
                      ? `Hide ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
                      : `Show ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
                  </button>
                )}
              </div>
            )}

            {showReplyForm && (
              <form className="mt-3 grid gap-2" onSubmit={handleSubmitReply}>
                {errorMessage && (
                  <p className="text-xs text-destructive">{errorMessage}</p>
                )}
                <Textarea
                  ref={replyTextareaRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                  placeholder={`Reply to ${comment.user.name}...`}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {showReplies && replies.length > 0 && (
        <div>
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              recipeId={recipeId}
              onReplyAdded={onReplyAdded}
              onDeleted={onDeleted}
              onEdited={onEdited}
              onPinToggled={onPinToggled}
              parentId={comment.id}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleReplyAdded = (parentId: string, reply: Comment) => {
    setComments((current) =>
      current.map((c) =>
        c.id === parentId ? { ...c, replies: [...(c.replies ?? []), reply] } : c
      )
    );
    router.refresh();
  };

  const handleDeleted = (commentId: string, parentId?: string) => {
    setComments((current) => {
      if (parentId) {
        return current.map((c) =>
          c.id === parentId
            ? { ...c, replies: (c.replies ?? []).filter((r) => r.id !== commentId) }
            : c
        );
      }
      return current.filter((c) => c.id !== commentId);
    });
    router.refresh();
  };

  const handleEdited = (commentId: string, newText: string, parentId?: string) => {
    setComments((current) => {
      if (parentId) {
        return current.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: (c.replies ?? []).map((r) =>
                  r.id === commentId ? { ...r, text: newText } : r
                ),
              }
            : c
        );
      }
      return current.map((c) =>
        c.id === commentId ? { ...c, text: newText } : c
      );
    });
  };

  const handlePinToggled = (commentId: string, pinned: boolean) => {
    setComments((current) =>
      current
        .map((c) => (c.id === commentId ? { ...c, isPinned: pinned } : c))
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        })
    );
  };

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
        .single<{ id: string; body: string; created_at: string }>();

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
          replies: [],
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
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUser={currentUser}
                  recipeId={recipeId}
                  onReplyAdded={handleReplyAdded}
                  onDeleted={handleDeleted}
                  onEdited={handleEdited}
                  onPinToggled={handlePinToggled}
                />
              ))
            ) : (
              <div className="border-2 border-dashed border-foreground p-6 text-center text-sm text-muted-foreground">
                No questions yet. Be the first to ask or share a tip.
              </div>
            )}
          </div>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            {errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}
            <Textarea
              ref={textareaRef}
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
