import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getRecipeBySlug } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Bookmark, Star, Utensils, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const recipe = getRecipeBySlug(params.slug);

  if (!recipe) {
    notFound();
  }

  const coverImage = PlaceHolderImages.find((p) => p.id === recipe.imageId);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <article>
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

        <Card className="overflow-hidden mb-8 shadow-lg">
          <div className="relative w-full aspect-video">
            {coverImage && (
              <Image
                src={coverImage.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
                data-ai-hint={coverImage.imageHint}
                priority
              />
            )}
          </div>
        </Card>
        
        <Card className="mb-8">
            <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <Clock className="mx-auto h-7 w-7 mb-2 text-primary" />
                        <p className="text-sm font-semibold">Prep Time</p>
                        <p className="text-sm text-muted-foreground">{recipe.prepTime}</p>
                    </div>
                    <div>
                        <Utensils className="mx-auto h-7 w-7 mb-2 text-primary" />
                        <p className="text-sm font-semibold">Cook Time</p>
                        <p className="text-sm text-muted-foreground">{recipe.cookTime}</p>
                    </div>
                    <div>
                        <User className="mx-auto h-7 w-7 mb-2 text-primary" />
                        <p className="text-sm font-semibold">Servings</p>
                        <p className="text-sm text-muted-foreground">{recipe.servings}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="prose prose-lg max-w-none text-foreground prose-headings:font-headline prose-headings:text-foreground mb-8">
            <p className="lead">{recipe.story}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl md:text-3xl font-bold">Ingredients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {recipe.ingredients.map((ing, index) => (
                            <li key={index} className="flex gap-3">
                                <span className="text-primary font-bold">&bull;</span>
                                <div>
                                <span className="font-semibold">{ing.quantity}</span>
                                <span className="text-muted-foreground"> {ing.name}</span>
                                </div>
                            </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl md:text-3xl font-bold">Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-none space-y-6">
                            {recipe.steps.map((step, index) => (
                            <li key={index} className="flex items-start">
                                <div className="flex-shrink-0 mr-4 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 font-bold font-headline text-primary">
                                {index + 1}
                                </div>
                                <p className="pt-1">{step}</p>
                            </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </div>
        
        <Separator className="my-12" />

        <div className="flex justify-center items-center gap-8 mb-12">
            <div className="text-center">
                <Button variant="outline" size="lg" className="rounded-full mb-1">
                <Heart className="h-6 w-6 mr-2"/> {recipe.likes} Likes
                </Button>
            </div>
                <div className="text-center">
                <Button variant="outline" size="lg" className="rounded-full mb-1">
                <Bookmark className="h-6 w-6 mr-2"/> Save
                </Button>
            </div>
                <div className="text-center">
                <Button variant="outline" size="lg" className="rounded-full mb-1">
                <Star className="h-6 w-6 mr-2"/> Favorite
                </Button>
            </div>
        </div>

      </article>
    </div>
  );
}
