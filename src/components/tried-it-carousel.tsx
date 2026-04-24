'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const CUTE_STICKERS = ['🍳', '🥘', '🫕', '🥗', '🍜', '🧆', '🥙', '🍲', '🥣', '🍱'];
const TAPE_COLORS = ['var(--brass)', 'var(--blush)', 'var(--sage)', 'var(--lavender)'];
const CORNER_DOODLES = ['✨', '🌸', '🌿', '⭐', '🌷', '💫'];

function getPostDoodleProps(id: string) {
  const code = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    sticker: CUTE_STICKERS[code % CUTE_STICKERS.length],
    tapeColor: TAPE_COLORS[code % TAPE_COLORS.length],
    tapeRotation: (code % 2 === 0 ? 1 : -1) * (1 + (code % 4)),
    cornerDoodle: CORNER_DOODLES[(code + 3) % CORNER_DOODLES.length],
    stickerRotation: (code % 2 === 0 ? 1 : -1) * (6 + (code % 10)),
  };
}

export function TriedItCarousel({ posts }: TriedItCarouselProps) {
  const router = useRouter();

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
          {posts.map((post) => {
            const { sticker, tapeColor, tapeRotation, cornerDoodle, stickerRotation } = getPostDoodleProps(post.id);
            return (
              <CarouselItem key={post.id} className="basis-1/2 md:basis-1/2 lg:basis-1/3">
                <div
                  className="border-2 border-foreground bg-paper paper-shadow h-full flex flex-col overflow-hidden relative cursor-pointer"
                  onClick={() => router.push(`/community/${post.id}`)}
                >
                  {/* Tape strip */}
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 border border-foreground/60 z-10"
                    style={{ backgroundColor: tapeColor, opacity: 0.65, rotate: `${tapeRotation}deg` }}
                    aria-hidden="true"
                  />

                  {post.imageUrl ? (
                    <div className="aspect-square overflow-hidden bg-secondary/20 relative">
                      <img
                        src={post.imageUrl}
                        alt={post.caption}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span
                        className="absolute bottom-2 right-2 text-2xl select-none pointer-events-none drop-shadow-sm"
                        style={{ rotate: `${stickerRotation}deg` }}
                        aria-hidden="true"
                      >
                        {sticker}
                      </span>
                    </div>
                  ) : (
                    <div className="aspect-square bg-secondary/20 flex items-center justify-center">
                      <span className="text-4xl" aria-hidden="true">{sticker}</span>
                    </div>
                  )}

                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <svg width="100%" height="8" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M0 4 Q10 1 20 4 Q30 7 40 4 Q50 1 60 4 Q70 7 80 4 Q90 1 100 4 Q110 7 120 4 Q130 1 140 4 Q150 7 160 4 Q170 1 180 4 Q190 7 200 4" stroke="var(--sage-dark, #4a7a40)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3"/>
                    </svg>

                    <p className="text-sm line-clamp-3 flex-1">{post.caption}</p>

                    <div className="flex items-center justify-between">
                      <Link
                        href={`/profile/${post.user.id}`}
                        className="flex items-center gap-2 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={post.user.avatarUrl} alt={post.user.name} />
                          <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{post.user.name}</span>
                      </Link>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        {post.likes}
                        <span className="text-base" aria-hidden="true">{cornerDoodle}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
