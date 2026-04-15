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
import { RecipeCard } from '@/components/recipe-card';
import { RecipeImageCard } from '@/components/recipe-image-card';
import type { Recipe, CommunityPost, User } from '@/lib/types';
import { RecipeQaSection } from './RecipeQaSection';

interface RecipeClientPageProps {
  recipe: Recipe;
  relatedPosts: CommunityPost[];
  relatedRecipes: Recipe[];
  currentUser: User | null;
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
        // silently ignore — view tracking is non-critical
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
      <article className="mx-auto max-w-5xl border-2 border-foreground bg-paper p-4 sm:p-6 paper-shadow md:p-10">
        <header className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4">{recipe.category.name}</Badge>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-6xl !leading-tight tracking-tight mb-4">
            {recipe.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{recipe.description}</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={recipe.author.avatarUrl} alt={recipe.author.name} />
              <AvatarFallback>{recipe.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{recipe.author.name}</p>
              <p className="text-sm text-muted-foreground">
                Posted on {new Date(recipe.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

        {coverImage && (
          <div className="relative mb-8 aspect-video w-full border-2 border-foreground paper-shadow-sm">
            <Image
              src={coverImage.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              data-ai-hint={coverImage.imageHint}
              priority
            />
          </div>
        )}
        
        <div className="my-8 border-y-2 border-dashed border-foreground py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Prep Time</p>
                    <p className="font-semibold text-lg">{recipe.prepTime}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Cook Time</p>
                    <p className="font-semibold text-lg">{recipe.cookTime}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Servings</p>
                    <p className="font-semibold text-lg">{recipe.servings}</p>
                </div>
            </div>
        </div>

        <div className="my-8 border-2 border-foreground bg-secondary p-6 text-lg text-foreground/90 paper-shadow-sm">
            <p className="italic leading-relaxed">{recipe.story}</p>
        </div>

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
              <h2 className="mb-4 font-headline text-3xl">More Photos</h2>
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

        <div className="flex justify-center items-center gap-4 flex-wrap">
            <Button
              variant={isLiked ? 'secondary' : 'outline'}
              onClick={() => void toggleLike()}
              disabled={pendingAction === 'like'}
            >
              Likes ({likeCount})
            </Button>
            <Button
              variant={isFavorited ? 'secondary' : 'outline'}
              onClick={() => void toggleFavorite()}
              disabled={pendingAction === 'favorite'}
            >
              Favorite ({favoriteCount})
            </Button>
            <Button
              variant="outline"
              onClick={() => void shareRecipe()}
              disabled={isSharing}
            >
              {isSharing ? 'Sharing...' : 'Share'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {viewCount} {viewCount === 1 ? 'view' : 'views'}
            </span>
        </div>
      </article>

      <RecipeQaSection
        recipeId={recipe.id}
        initialComments={recipe.comments}
        currentUser={currentUser}
      />

      <section className="max-w-6xl mx-auto mt-16 px-4">
        <h2 className="font-headline text-3xl md:text-4xl mb-8 text-center">Community Creations</h2>
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

      {relatedRecipes.length > 0 && (
        <section className="max-w-6xl mx-auto mt-16 px-4">
          <Separator className="mb-12" />
          <h2 className="font-headline text-3xl md:text-4xl mb-8 text-center">You May Also Like</h2>
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
