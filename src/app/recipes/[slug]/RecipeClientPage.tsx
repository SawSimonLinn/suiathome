'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useRecipeInteractions } from '@/hooks/use-recipe-interactions';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CommunityPostCard } from '@/components/community-post-card';
import { RecipeCard } from '@/components/recipe-card';
import type { Recipe, CommunityPost } from '@/lib/types';

interface RecipeClientPageProps {
  recipe: Recipe;
  relatedPosts: CommunityPost[];
  relatedRecipes: Recipe[];
}


export default function RecipeClientPage({ recipe, relatedPosts, relatedRecipes }: RecipeClientPageProps) {
  const {
    isLiked,
    isSaved,
    isFavorited,
    likeCount,
    favoriteCount,
    pendingAction,
    toggleLike,
    toggleSave,
    toggleFavorite,
  } = useRecipeInteractions({
    recipeId: recipe.id,
    initialLikeCount: recipe.likes,
    initialFavoriteCount: recipe.favorites,
    initialLiked: recipe.isLiked ?? false,
    initialSaved: recipe.isSaved ?? false,
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
      <article className="max-w-4xl mx-auto bg-card border shadow-paper p-6 md:p-10">
        <header className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4">{recipe.category.name}</Badge>
          <h1 className="font-headline text-4xl md:text-6xl !leading-tight tracking-tight mb-4">
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
          <div className="relative w-full aspect-video border shadow-paper-sm mb-8">
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
        
        <div className="border-y border-dashed border-border my-8 py-4">
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

        <div className="text-lg text-foreground/90 bg-secondary/50 p-6 my-8">
            <p className="italic leading-relaxed">{recipe.story}</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
            <div className="md:col-span-2">
                <h2 className="font-headline text-3xl mb-4 border-b-2 border-primary pb-2">Ingredients</h2>
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
                <h2 className="font-headline text-3xl mb-4 border-b-2 border-primary pb-2">Instructions</h2>
                <ol className="list-none space-y-6 text-base leading-loose">
                    {recipe.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1.5 flex h-8 w-8 items-center justify-center border-2 border-foreground rounded-full text-foreground font-bold font-headline text-lg">
                        {index + 1}
                        </div>
                        <p>{step}</p>
                    </li>
                    ))}
                </ol>
            </div>
        </div>
        
        <Separator className="my-12" />

        <div className="flex justify-center items-center gap-4">
            <Button
              variant={isLiked ? 'secondary' : 'outline'}
              onClick={() => void toggleLike()}
              disabled={pendingAction === 'like'}
            >
              Likes ({likeCount})
            </Button>
            <Button
              variant={isSaved ? 'secondary' : 'outline'}
              onClick={() => void toggleSave()}
              disabled={pendingAction === 'save'}
            >
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button
              variant={isFavorited ? 'secondary' : 'outline'}
              onClick={() => void toggleFavorite()}
              disabled={pendingAction === 'favorite'}
            >
              Favorite ({favoriteCount})
            </Button>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="max-w-4xl mx-auto mt-16">
            <h2 className="font-headline text-3xl md:text-4xl mb-8 text-center">Community Creations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedPosts.map(post => (
                    <CommunityPostCard key={post.id} post={post} />
                ))}
            </div>
        </section>
      )}

      {relatedRecipes.length > 0 && (
        <section className="max-w-4xl mx-auto mt-16">
             <Separator className="my-12" />
            <h2 className="font-headline text-3xl md:text-4xl mb-8 text-center">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {relatedRecipes.map(relatedRecipe => (
                    <RecipeCard key={relatedRecipe.id} recipe={relatedRecipe} />
                ))}
            </div>
        </section>
      )}

    </div>
  );
}
