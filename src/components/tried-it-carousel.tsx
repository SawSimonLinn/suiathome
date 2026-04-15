'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { CommunityPost } from '@/lib/types';

interface TriedItCarouselProps {
  posts: CommunityPost[];
}

export function TriedItCarousel({ posts }: TriedItCarouselProps) {
  if (posts.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No community posts yet. Be the first to share your creation!
      </p>
    );
  }

  return (
    <div className="px-12">
      <Carousel opts={{ align: 'start', loop: true }}>
        <CarouselContent>
          {posts.map((post) => (
            <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="border-2 border-foreground bg-paper paper-shadow h-full flex flex-col overflow-hidden">
                {post.imageUrl ? (
                  <div className="aspect-square overflow-hidden bg-secondary/20">
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-secondary/20 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No photo</span>
                  </div>
                )}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <p className="text-sm line-clamp-3 flex-1">{post.caption}</p>
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/profile/${post.user.id}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={post.user.avatarUrl} alt={post.user.name} />
                        <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{post.user.name}</span>
                    </Link>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </span>
                  </div>
                  {post.linkedRecipeId && (
                    <Link
                      href={`/community`}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      View in community →
                    </Link>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
