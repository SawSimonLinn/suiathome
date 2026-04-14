'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { UserRoleBadge } from '@/components/user-role-badge';
import type { CommunityPost, User } from '@/lib/types';

interface CommunityPostCardProps {
  post: CommunityPost;
  currentUser?: User | null;
  canEdit?: boolean;
  onEdit?: (post: CommunityPost) => void;
}

export function CommunityPostCard({
  post,
  currentUser = null,
  canEdit = false,
  onEdit,
}: CommunityPostCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const formatPostedDate = (date: string) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(date));

  const handleCommentSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!currentUser) {
      setCommentError('Sign in to comment on community posts.');
      return;
    }

    if (!commentText.trim()) {
      setCommentError('Write a comment before posting.');
      return;
    }

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const supabase = createClient();
      const { data: insertedComment, error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: post.id,
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
        setCommentError(error?.message || 'Could not post comment.');
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
      setIsCommentsOpen(true);
      router.refresh();
      toast({
        title: 'Comment posted',
        description: 'Your comment is now part of the conversation.',
      });
    } catch (error) {
      setCommentError(
        error instanceof Error ? error.message : 'Could not post comment.'
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar>
          <AvatarImage src={post.user.avatarUrl} alt={post.user.name} />
          <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{post.user.name}</p>
            <UserRoleBadge user={post.user} />
          </div>
          <p className="text-sm text-muted-foreground">
            Posted {formatPostedDate(post.createdAt)}
          </p>
        </div>
        {canEdit && onEdit ? (
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={() => onEdit(post)}
          >
            Edit
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {post.imageUrl && (
          <div className="flex justify-center border-y bg-secondary/20">
            <img
              src={post.imageUrl}
              alt={post.caption}
              className="block h-auto max-h-[720px] w-auto max-w-full"
              loading="lazy"
            />
          </div>
        )}
        <p className="p-4 text-base">{post.caption}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-2">
        <Button variant="ghost" onClick={handleLike}>
          {isLiked ? 'Unlike' : 'Like'} ({likeCount})
        </Button>
        <Button variant="ghost" onClick={() => setIsCommentsOpen((open) => !open)}>
          {isCommentsOpen ? 'Hide Comments' : 'Comment'} ({comments.length})
        </Button>
      </CardFooter>
      {isCommentsOpen ? (
        <div className="border-t bg-secondary/20 p-4">
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border bg-background p-3 shadow-paper-sm"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
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
              <p className="text-sm text-muted-foreground">
                No comments yet. Start the conversation.
              </p>
            )}

            <form className="grid gap-3" onSubmit={handleCommentSubmit}>
              {commentError ? (
                <p className="text-sm text-destructive">{commentError}</p>
              ) : null}
              <Textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder={
                  currentUser
                    ? 'Add your comment...'
                    : 'Sign in to join the conversation.'
                }
                disabled={!currentUser || isSubmittingComment}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!currentUser || isSubmittingComment}
                >
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
