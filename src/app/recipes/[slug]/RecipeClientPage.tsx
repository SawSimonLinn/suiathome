'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useRecipeInteractions } from '@/hooks/use-recipe-interactions';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CommunityPostCard } from '@/components/community-post-card';
import { CreateCommunityPostCard } from '@/components/create-community-post-card';
import { ImageStripLightbox } from '@/components/image-strip-lightbox';
import { RecipeImageCard } from '@/components/recipe-image-card';
import type { Recipe, CommunityPost, User } from '@/lib/types';
import { RecipeQaSection } from './RecipeQaSection';

interface RecipeClientPageProps {
  recipe: Recipe;
  relatedPosts: CommunityPost[];
  relatedRecipes: Recipe[];
  currentUser: User | null;
}

const SECTION_FLOWERS = ['🌸', '🌼', '🌸', '🌼', '🌸'];

function SquigglyLine({ width = 180, opacity = 0.5 }: { width?: number; opacity?: number }) {
  return (
    <svg width={width} height="12" viewBox={`0 0 ${width} 12`} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d={`M2 8 ${Array.from({ length: Math.floor(width / 12) }, (_, i) => {
          const x1 = 2 + i * 12;
          const x2 = x1 + 6;
          const x3 = x2 + 6;
          const y = i % 2 === 0 ? 2 : 10;
          return `Q${x2} ${y} ${x3} 8`;
        }).join(' ')}`}
        stroke="var(--sage-dark)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity={opacity}
      />
    </svg>
  );
}

export default function RecipeClientPage({
  recipe,
  relatedPosts,
  relatedRecipes,
  currentUser,
}: RecipeClientPageProps) {
  const [viewCount, setViewCount] = useState(recipe.views);

  useEffect(() => {
    async function trackView() {
      try {
        const supabase = createClient();
        await supabase.from('recipe_views').insert({ recipe_id: recipe.id });
        setViewCount((c) => c + 1);
      } catch {
        // Silently ignore: view tracking is non-critical.
      }
    }
    void trackView();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe.id]);

  const {
    isLiked,
    isFavorited,
    likeCount,
    favoriteCount,
    isSharing,
    pendingAction,
    toggleLike,
    toggleFavorite,
    shareRecipe,
  } = useRecipeInteractions({
    recipeId: recipe.id,
    recipeSlug: recipe.slug,
    recipeTitle: recipe.title,
    initialLikeCount: recipe.likes,
    initialFavoriteCount: recipe.favorites,
    initialLiked: recipe.isLiked ?? false,
    initialFavorited: recipe.isFavorited ?? false,
  });

  const coverImage = recipe.imageUrl
    ? {
        imageUrl: recipe.imageUrl,
        imageHint: recipe.imageHint || 'recipe photo',
      }
    : PlaceHolderImages.find((p) => p.id === recipe.imageId);

  return (
    <div className="py-8 md:py-12">
      <article className="mx-auto max-w-5xl border-2 border-foreground bg-paper paper-shadow relative overflow-hidden">

        {/* Sage green top ribbon: mirrors hero */}
        <div className="w-full border-b-2 border-foreground py-2 px-4 flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--sage)' }}>
          <span className="text-sm font-medium tracking-widest uppercase" style={{ color: '#2d4a2a' }}>
            🌿 &nbsp; Homemade with love &nbsp; 🌿
          </span>
        </div>

        <div className="p-4 sm:p-6 md:p-10">

          {/* Tape strips: like hero card */}
          <div className="absolute top-[3.5rem] left-5 w-14 h-5 border border-foreground/60 rotate-[-3deg]" style={{ backgroundColor: 'var(--brass)', opacity: 0.6 }} aria-hidden="true" />
          <div className="absolute top-[3.5rem] right-7 w-12 h-5 border border-foreground/60 rotate-[2deg]" style={{ backgroundColor: 'var(--blush)' }} aria-hidden="true" />

          <header className="mb-8 text-center">
            {/* Flower row */}
            <div className="flex justify-center gap-2 mb-4" aria-hidden="true">
              {SECTION_FLOWERS.map((f, i) => (
                <span key={i} className="text-xl">{f}</span>
              ))}
            </div>

            <Badge variant="secondary" className="mb-4 border border-foreground/30">{recipe.category.name}</Badge>

            <h1 className="font-headline text-3xl sm:text-4xl md:text-6xl !leading-tight tracking-tight mb-3" style={{ color: '#2d4a2a' }}>
              {recipe.title}
            </h1>

            {/* Squiggly underline */}
            <div className="flex justify-center mt-3 mb-5">
              <SquigglyLine width={220} opacity={0.5} />
            </div>

            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{recipe.description}</p>

            {/* Lavender divider */}
            <div className="mx-auto mt-6 mb-5 h-[3px] w-20 border-0" style={{ backgroundColor: 'var(--lavender)' }} />

            <div className="mt-2 flex items-center justify-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-foreground">
                <AvatarImage src={recipe.author.avatarUrl} alt={recipe.author.name} />
                <AvatarFallback>{recipe.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{recipe.author.name}</p>
                <p className="text-sm text-muted-foreground">
                  Posted on {new Date(recipe.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {viewCount} {viewCount === 1 ? 'view' : 'views'}
                </p>
              </div>
            </div>
          </header>

          {coverImage && (
            <div className="relative mb-8 aspect-video w-full border-2 border-foreground paper-shadow-sm overflow-hidden">
              <Image
                src={coverImage.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
                data-ai-hint={coverImage.imageHint}
                priority
              />
              {/* Cute sticker on cover image */}
              <span className="absolute top-3 right-3 text-3xl select-none pointer-events-none drop-shadow-md rotate-[8deg]" aria-hidden="true">🍜</span>
              {/* Tape strip on image */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-5 border border-foreground/60 rotate-[-1deg]" style={{ backgroundColor: 'var(--brass)', opacity: 0.65 }} aria-hidden="true" />
            </div>
          )}

          {/* Stats */}
          <div className="my-8 border-y-2 border-dashed border-foreground py-5" style={{ backgroundColor: 'var(--cream-warm)' }}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Prep Time</p>
                <p className="font-bold text-lg mt-0.5">{recipe.prepTime}</p>
              </div>
              <div className="border-x-2 border-dashed border-foreground/30">
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Cook Time</p>
                <p className="font-bold text-lg mt-0.5">{recipe.cookTime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Servings</p>
                <p className="font-bold text-lg mt-0.5">{recipe.servings}</p>
              </div>
            </div>
          </div>

          {/* Story block */}
          <div className="my-8 border-2 border-foreground p-6 text-lg text-foreground/90 paper-shadow-sm relative" style={{ backgroundColor: 'var(--blush-light)' }}>
            {/* Tape strip on story card */}
            <div className="absolute -top-2 left-8 w-10 h-4 border border-foreground/60 rotate-[2deg]" style={{ backgroundColor: 'var(--lavender)', opacity: 0.8 }} aria-hidden="true" />
            <p className="italic leading-relaxed">{recipe.story}</p>
          </div>

          {/* Ingredients + Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 lg:gap-12">
            <div className="md:col-span-2">
              <h2 className="mb-4 border-b-2 border-foreground pb-2 font-headline text-3xl">Ingredients</h2>
              <ul className="space-y-3 text-base">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index} className="flex gap-3 items-start p-2">
                    <div>
                      <span className="font-semibold">{ing.quantity}</span>
                      <span className="text-muted-foreground"> {ing.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3">
              <h2 className="mb-4 border-b-2 border-foreground pb-2 font-headline text-3xl">Instructions</h2>
              <ol className="list-none space-y-6 text-base leading-loose">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="mt-1.5 flex h-8 w-8 flex-shrink-0 items-center justify-center border-2 border-foreground text-foreground font-bold font-headline text-lg">
                      {index + 1}
                    </div>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {recipe.galleryImages && recipe.galleryImages.length > 0 ? (
            <>
              <Separator className="my-12" />
              <section>
                <h2 className="mb-4 font-headline text-3xl flex items-center gap-2">📸 More Photos</h2>
                <ImageStripLightbox
                  dialogTitle={`${recipe.title} photos`}
                  dialogDescription={`Large preview for the additional images in ${recipe.title}.`}
                  images={recipe.galleryImages.map((image, index) => ({
                    alt: `${recipe.title} photo ${index + 2}`,
                    src: image.url,
                  }))}
                />
              </section>
            </>
          ) : null}

          <Separator className="my-12" />

          {/* Like / Favorite / Share */}
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <Button
              variant={isLiked ? 'secondary' : 'outline'}
              onClick={() => void toggleLike()}
              disabled={pendingAction === 'like'}
              className="border-2 border-foreground paper-btn font-semibold"
            >
              Likes ({likeCount})
            </Button>
            <Button
              variant={isFavorited ? 'secondary' : 'outline'}
              onClick={() => void toggleFavorite()}
              disabled={pendingAction === 'favorite'}
              className="border-2 border-foreground paper-btn font-semibold"
            >
              Favorite ({favoriteCount})
            </Button>
            <Button
              variant="outline"
              onClick={() => void shareRecipe()}
              disabled={isSharing}
              className="border-2 border-foreground paper-btn font-semibold"
            >
              {isSharing ? 'Sharing...' : 'Share'}
            </Button>
          </div>
        </div>

        {/* Bottom floral strip: mirrors hero */}
        <div className="w-full border-t-2 border-foreground py-2 flex justify-center gap-3 text-lg" style={{ backgroundColor: 'var(--blush-light)' }} aria-hidden="true">
          <span>🌷</span><span>🌿</span><span>🫶</span><span>🌿</span><span>🌷</span>
        </div>
      </article>

      <RecipeQaSection
        recipeId={recipe.id}
        initialComments={recipe.comments}
        currentUser={currentUser}
      />

      {/* Community Creations section */}
      <section className="max-w-6xl mx-auto mt-16 px-4">
        <div className="text-center mb-8">
          <h2 className="font-headline text-3xl md:text-4xl" style={{ color: '#2d4a2a' }}>Community Creations</h2>
          <div className="flex justify-center mt-3">
            <SquigglyLine width={160} opacity={0.45} />
          </div>
          <div className="flex justify-center gap-2 mt-2" aria-hidden="true">
            {['🍳', '🥘', '🫕'].map((e, i) => <span key={i} className="text-lg">{e}</span>)}
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
          {relatedPosts.map(post => (
            <div key={post.id} className="w-[min(88vw,420px)] shrink-0 snap-start">
              <CommunityPostCard
                post={post}
                currentUser={currentUser}
              />
            </div>
          ))}
          <div className="w-[min(85vw,360px)] shrink-0 snap-start">
            <CreateCommunityPostCard
              recipeId={recipe.id}
              recipeTitle={recipe.title}
              currentUser={currentUser}
            />
          </div>
        </div>
      </section>

      {/* You May Also Like section */}
      {relatedRecipes.length > 0 && (
        <section className="max-w-6xl mx-auto mt-16 px-4">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-2 mb-3" aria-hidden="true">
              {SECTION_FLOWERS.map((f, i) => <span key={i} className="text-lg">{f}</span>)}
            </div>
            <h2 className="font-headline text-3xl md:text-4xl" style={{ color: '#2d4a2a' }}>You May Also Like</h2>
            <div className="flex justify-center mt-3">
              <SquigglyLine width={160} opacity={0.45} />
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
            {relatedRecipes.map(relatedRecipe => (
              <div key={relatedRecipe.id} className="w-[min(85vw,320px)] shrink-0 snap-start">
                <RecipeImageCard recipe={relatedRecipe} />
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
