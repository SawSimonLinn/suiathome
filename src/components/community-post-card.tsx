'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { CommunityPost } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

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
  
  const formatPostedDate = (date: string) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(date));

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
            Posted {formatPostedDate(post.createdAt)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {post.imageUrl && (
          <div className="relative w-full aspect-square border-y">
            <Image
              src={post.imageUrl}
              alt={post.caption}
              fill
              className="object-cover"
              data-ai-hint={post.imageHint}
            />
          </div>
        )}
         <p className="p-4 text-base">{post.caption}</p>

      </CardContent>
      <CardFooter className="flex justify-between items-center p-2 border-t mt-2">
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
