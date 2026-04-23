'use client';
import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { UserRoleBadge } from '@/components/user-role-badge';
import { cn } from '@/lib/utils';
import type { CommunityPost, User } from '@/lib/types';

interface CommunityPostCardProps {
  post: CommunityPost;
  currentUser?: User | null;
  canEdit?: boolean;
  onEdit?: (post: CommunityPost) => void;
  onDelete?: (postId: string) => void;
  onToggleHide?: (post: CommunityPost) => void;
}

export function CommunityPostCard({
  post,
  currentUser = null,
  canEdit = false,
  onEdit,
  onDelete,
  onToggleHide,
}: CommunityPostCardProps) {
  const router = useRouter();
  const captionRef = useRef<HTMLParagraphElement | null>(null);
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [canExpandCaption, setCanExpandCaption] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setIsLiked(post.isLiked ?? false);
    setLikeCount(post.likes);
    setComments(post.comments);
  }, [post.comments, post.isLiked, post.likes]);

  useEffect(() => {
    setIsCaptionExpanded(false);
    setCanExpandCaption(false);
  }, [post.caption]);

  useEffect(() => {
    const captionElement = captionRef.current;

    if (!captionElement) {
      return;
    }

    const updateCaptionClamp = () => {
      if (isCaptionExpanded) {
        return;
      }

      setCanExpandCaption(captionElement.scrollHeight > captionElement.clientHeight + 1);
    };

    if (typeof window === 'undefined') {
      updateCaptionClamp();
      return;
    }

    const frameId = window.requestAnimationFrame(updateCaptionClamp);

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    const observer = new ResizeObserver(updateCaptionClamp);
    observer.observe(captionElement);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [isCaptionExpanded, post.caption]);

  const handleImageOpen = () => {
    setIsImageOpen(true);
  };

  const handleLike = async () => {
    let supabase;

    try {
      supabase = createClient();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Supabase is not configured',
        description:
          error instanceof Error
            ? error.message
            : 'Add your Supabase URL and publishable key first.',
      });
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast({
        variant: 'destructive',
        title: 'Sign in required',
        description: 'Log in to like community posts.',
      });
      return;
    }

    setIsTogglingLike(true);

    const previousLiked = isLiked;
    setIsLiked(!previousLiked);
    setLikeCount((current) => current + (previousLiked ? -1 : 1));

    const query = previousLiked
      ? supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)
      : supabase.from('community_post_likes').insert({
          post_id: post.id,
          user_id: user.id,
        });

    const { error } = await query;

    if (error) {
      setIsLiked(previousLiked);
      setLikeCount((current) => current + (previousLiked ? 1 : -1));
      toast({
        variant: 'destructive',
        title: 'Could not update like',
        description: error.message,
      });
      setIsTogglingLike(false);
      return;
    }

    router.refresh();
    setIsTogglingLike(false);
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

  const CUTE_STICKERS = ['🌸', '🍓', '🌷', '✨', '🧁', '🌼', '🍰', '🌺', '🫶', '🌿'];
  const TAPE_COLORS = ['var(--brass)', 'var(--blush)', 'var(--sage)', 'var(--lavender)'];
  const code = post.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const headerSticker = CUTE_STICKERS[code % CUTE_STICKERS.length];
  const tapeColor = TAPE_COLORS[code % TAPE_COLORS.length];
  const tapeRot = (code % 2 === 0 ? 1 : -1) * (1 + (code % 3));
  const imgStickerRot = (code % 2 === 0 ? 1 : -1) * (6 + (code % 10));

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, textarea, [role="dialog"]')) {
      return;
    }
    router.push(`/community/${post.id}`);
  };

  return (
    <Card
      className="h-full flex flex-col overflow-hidden border-2 border-foreground bg-paper paper-shadow relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Tape strip */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 border border-foreground/60 z-10"
        style={{ backgroundColor: tapeColor, opacity: 0.65, rotate: `${tapeRot}deg` }}
        aria-hidden="true"
      />
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar>
          <AvatarImage src={post.user.avatarUrl} alt={post.user.name} />
          <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid min-w-0 flex-1 gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/profile/${post.user.id}`} className="truncate font-semibold hover:underline">
              {post.user.name}
            </Link>
            <UserRoleBadge user={post.user} />
          </div>
          <p className="text-sm text-muted-foreground">
            Posted {formatPostedDate(post.createdAt)}
          </p>
        </div>
        <span className="ml-auto text-xl select-none pointer-events-none" aria-hidden="true">{headerSticker}</span>
        {canEdit && (onEdit || onDelete || onToggleHide) ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Post options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit ? (
                  <DropdownMenuItem onClick={() => onEdit(post)}>
                    Edit
                  </DropdownMenuItem>
                ) : null}
                {onToggleHide ? (
                  <DropdownMenuItem onClick={() => onToggleHide(post)}>
                    {post.isHidden ? 'Show post' : 'Hide post'}
                  </DropdownMenuItem>
                ) : null}
                {onDelete ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove your post and all its comments. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onDelete?.(post.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : null}
      </CardHeader>
      {post.isHidden ? (
        <div className="border-t border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
          This post is hidden from the community feed.
        </div>
      ) : null}
      <CardContent className="p-0 flex-1">
        {post.imageUrl && (
          <>
            <button
              type="button"
              className="group relative block aspect-video w-full overflow-hidden border-y bg-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => void handleImageOpen()}
              aria-label="Open full image"
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="block h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                loading="lazy"
              />
              {/* Cute sticker on image */}
              <span
                className="absolute top-2 right-2 text-2xl select-none pointer-events-none drop-shadow-sm"
                style={{ rotate: `${imgStickerRot}deg` }}
                aria-hidden="true"
              >
                {CUTE_STICKERS[(code + 5) % CUTE_STICKERS.length]}
              </span>
              <span className="absolute bottom-3 right-3 border-2 border-foreground bg-paper px-2 py-1 text-xs font-semibold uppercase tracking-wide opacity-0 transition-opacity group-hover:opacity-100">
                View Full Image
              </span>
            </button>

            <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
              <DialogContent className="w-[min(94vw,1100px)] max-w-[1100px] bg-background p-3 sm:p-4">
                <DialogTitle className="sr-only">Community post image</DialogTitle>
                <DialogDescription className="sr-only">
                  Full-size view of the selected community post image.
                </DialogDescription>
                <div className="flex justify-center overflow-hidden border-2 border-foreground bg-secondary/20">
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    className="block h-auto max-h-[80vh] w-auto max-w-full object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
        <div className="p-4">
          <svg width="100%" height="8" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden="true" className="mb-3">
            <path d="M0 4 Q10 1 20 4 Q30 7 40 4 Q50 1 60 4 Q70 7 80 4 Q90 1 100 4 Q110 7 120 4 Q130 1 140 4 Q150 7 160 4 Q170 1 180 4 Q190 7 200 4" stroke="var(--sage-dark, #4a7a40)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3"/>
          </svg>
          <p
            ref={captionRef}
            className={cn(
              'text-base leading-7',
              !isCaptionExpanded &&
                'overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]'
            )}
          >
            {post.caption}
          </p>
          {canExpandCaption ? (
            <button
              type="button"
              className="mt-0.5 text-sm font-medium underline underline-offset-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsCaptionExpanded((c) => !c)}
            >
              {isCaptionExpanded ? 'See less' : 'See more'}
            </button>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-1 border-t p-2">
        <Button
          size="sm"
          variant={isLiked ? 'secondary' : 'ghost'}
          onClick={() => void handleLike()}
          disabled={isTogglingLike}
          className="shrink-0"
        >
          {isLiked ? 'Unlike' : 'Like'} ({likeCount})
        </Button>
        <div />
        <Button size="sm" variant="ghost" onClick={() => setIsCommentsOpen((open) => !open)} className="shrink-0">
          {isCommentsOpen ? 'Hide' : 'Comment'} ({comments.length})
        </Button>
      </CardFooter>
      {isCommentsOpen ? (
        <div className="border-t bg-secondary/20 p-4">
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-2 border-foreground bg-paper p-3 paper-shadow-sm"
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
                        <Link href={`/profile/${comment.user.id}`} className="font-medium hover:underline">
                          {comment.user.name}
                        </Link>
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
