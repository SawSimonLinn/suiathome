'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { CommunityPost } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from './ui/separator';

interface CommunityPostCardProps {
  post: CommunityPost;
}

export function CommunityPostCard({ post }: CommunityPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar>
          <AvatarImage src={post.user.avatarUrl} alt={post.user.name} />
          <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5">
          <p className="font-semibold">{post.user.name}</p>
          <p className="text-sm text-muted-foreground">
            {timeAgo(post.createdAt)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {post.imageUrl && (
          <div className="relative w-full aspect-square">
            <Image
              src={post.imageUrl}
              alt={post.caption}
              fill
              className="object-cover"
              data-ai-hint={post.imageHint}
            />
          </div>
        )}
         <p className="p-4">{post.caption}</p>

         {post.linkedRecipe && (
            <>
                <Separator />
                <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-2">Inspired by:</p>
                    <Link href={`/recipes/${post.linkedRecipe.slug}`} className="block">
                        <div className="flex items-center gap-3 p-3 rounded-md border bg-secondary/50 hover:bg-secondary transition-colors">
                            <div className="flex-grow">
                                <p className="font-semibold">{post.linkedRecipe.title}</p>
                                <p className="text-sm text-muted-foreground">{post.linkedRecipe.category.name}</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </>
         )}

      </CardContent>
      <CardFooter className="flex justify-between items-center p-2">
        <Button variant="ghost" onClick={handleLike}>
          {isLiked ? 'Unlike' : 'Like'} ({likeCount})
        </Button>
        <Button variant="ghost">
          Comment ({post.comments.length})
        </Button>
      </CardFooter>
    </Card>
  );
}
