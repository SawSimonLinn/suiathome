'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CommunityPostCard } from '@/components/community-post-card';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import type { CommunityPost, User } from '@/lib/types';

interface ProfilePostsClientProps {
  initialPosts: CommunityPost[];
  currentUser: User | null;
  isOwner: boolean;
  emptyMessage?: string;
}

export function ProfilePostsClient({ initialPosts, currentUser, isOwner, emptyMessage }: ProfilePostsClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', currentUser.id);

      if (error) {
        toast({ variant: 'destructive', title: 'Could not delete post', description: error.message });
        return;
      }

      setPosts((current) => current.filter((p) => p.id !== postId));
      router.refresh();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not delete post', description: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleToggleHide = async (post: CommunityPost) => {
    if (!currentUser) return;

    const newHidden = !post.isHidden;
    setPosts((current) =>
      current.map((p) => (p.id === post.id ? { ...p, isHidden: newHidden } : p))
    );

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('community_posts')
        .update({ is_hidden: newHidden })
        .eq('id', post.id)
        .eq('user_id', currentUser.id);

      if (error) {
        setPosts((current) =>
          current.map((p) => (p.id === post.id ? { ...p, isHidden: post.isHidden } : p))
        );
        toast({ variant: 'destructive', title: 'Could not update post', description: error.message });
        return;
      }

      router.refresh();
    } catch (error) {
      setPosts((current) =>
        current.map((p) => (p.id === post.id ? { ...p, isHidden: post.isHidden } : p))
      );
      toast({ variant: 'destructive', title: 'Could not update post', description: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  if (posts.length === 0) {
    return (
      <div className="border-2 border-foreground bg-paper py-12 text-center paper-shadow">
        <p className="text-lg font-semibold">No posts yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {emptyMessage ?? "This member hasn't shared anything in the community yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {posts.map((post) => (
        <CommunityPostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          canEdit={isOwner}
          onDelete={isOwner ? handleDeletePost : undefined}
          onToggleHide={isOwner ? handleToggleHide : undefined}
        />
      ))}
    </div>
  );
}
