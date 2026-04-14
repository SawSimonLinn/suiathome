'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getRecipeBySlug, getCommunityPostsByRecipeId, getRelatedRecipes } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CommunityPostCard } from '@/components/community-post-card';
import { RecipeCard } from '@/components/recipe-card';

export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const recipe = getRecipeBySlug(params.slug);

  if (!recipe) {
    notFound();
  }
  
  const relatedPosts = getCommunityPostsByRecipeId(recipe.id, 2);
  const relatedRecipes = getRelatedRecipes(recipe, 3);
  const coverImage = PlaceHolderImages.find((p) => p.id === recipe.imageId);

  return (
    <div className="py-8 md:py-12">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4">{recipe.category.name}</Badge>
          <h1 className="font-headline text-4xl md:text-6xl font-bold !leading-tight tracking-tight mb-4">
            {recipe.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{recipe.description}</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Avatar>
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
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8">
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
        
        <div className="bg-card border rounded-lg p-6 mb-8">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Prep Time</p>
                    <p className="font-semibold">{recipe.prepTime}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Cook Time</p>
                    <p className="font-semibold">{recipe.cookTime}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Servings</p>
                    <p className="font-semibold">{recipe.servings}</p>
                </div>
            </div>
        </div>

        <div className="text-lg text-foreground/90 bg-accent/50 p-6 rounded-lg mb-8">
            <p>{recipe.story}</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
                <h2 className="font-headline text-3xl font-bold mb-4">Ingredients</h2>
                <ul className="space-y-3">
                    {recipe.ingredients.map((ing, index) => (
                    <li key={index} className="flex gap-3 items-start p-2 rounded-md bg-secondary/50">
                        <div>
                        <span className="font-semibold">{ing.quantity}</span>
                        <span className="text-muted-foreground"> {ing.name}</span>
                        </div>
                    </li>
                    ))}
                </ul>
            </div>
            
            <div className="md:col-span-3">
                <h2 className="font-headline text-3xl font-bold mb-4">Instructions</h2>
                <ol className="list-none space-y-6">
                    {recipe.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold font-headline text-xl">
                        {index + 1}
                        </div>
                        <p className="pt-1.5">{step}</p>
                    </li>
                    ))}
                </ol>
            </div>
        </div>
        
        <Separator className="my-12" />

        <div className="flex justify-center items-center gap-4">
            <Button variant="outline">
              Likes ({recipe.likes})
            </Button>
            <Button variant="outline">
              Save
            </Button>
            <Button variant="outline">
              Favorite
            </Button>
        </div>

      </article>

      {relatedPosts.length > 0 && (
        <section className="max-w-4xl mx-auto mt-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-8 text-center">Community Creations</h2>
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
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-8 text-center">You May Also Like</h2>
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