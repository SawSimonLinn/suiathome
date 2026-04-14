import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getRecipeBySlug, users } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Bookmark, Star, MessageCircle, Utensils, Clock, User } from 'lucide-react';

export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const recipe = getRecipeBySlug(params.slug);

  if (!recipe) {
    notFound();
  }

  const coverImage = PlaceHolderImages.find((p) => p.id === recipe.imageId);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      <article>
        <header className="mb-8">
          <Badge variant="secondary" className="mb-4">{recipe.category.name}</Badge>
          <h1 className="font-headline text-4xl md:text-5xl font-bold !leading-tight tracking-tight mb-4">
            {recipe.title}
          </h1>
          <p className="text-lg text-muted-foreground">{recipe.description}</p>
          <div className="mt-6 flex items-center gap-4">
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

        <Card className="overflow-hidden mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section className="mb-8 prose prose-lg max-w-none text-foreground prose-headings:font-headline prose-headings:text-foreground">
              <p className="lead">{recipe.story}</p>
            </section>

            <Separator className="my-8" />
            
            <section className="mb-8">
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-6">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-4 h-4 mt-1 mr-3 bg-primary/20 rounded-full flex-shrink-0"></span>
                    <div>
                      <span className="font-semibold">{ing.quantity}</span>
                      <span className="text-muted-foreground"> {ing.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <Separator className="my-8" />

            <section>
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-6">Instructions</h2>
              <ol className="list-none space-y-6">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 mr-4 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary-foreground font-bold font-headline text-primary">
                      {index + 1}
                    </div>
                    <p className="pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="lg:col-span-1 lg:sticky lg:top-24 self-start">
            <Card className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <Clock className="mx-auto h-6 w-6 mb-1 text-primary" />
                  <p className="text-sm font-semibold">Prep Time</p>
                  <p className="text-xs text-muted-foreground">{recipe.prepTime}</p>
                </div>
                <div>
                  <Utensils className="mx-auto h-6 w-6 mb-1 text-primary" />
                  <p className="text-sm font-semibold">Cook Time</p>
                  <p className="text-xs text-muted-foreground">{recipe.cookTime}</p>
                </div>
                <div>
                  <User className="mx-auto h-6 w-6 mb-1 text-primary" />
                  <p className="text-sm font-semibold">Servings</p>
                  <p className="text-xs text-muted-foreground">{recipe.servings}</p>
                </div>
              </div>
              <Separator />
              <div className="flex justify-around items-center my-6">
                <div className="text-center">
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full mb-1">
                    <Heart className="h-6 w-6"/>
                  </Button>
                  <p className="text-sm font-medium">{recipe.likes} Likes</p>
                </div>
                 <div className="text-center">
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full mb-1">
                    <Bookmark className="h-6 w-6"/>
                  </Button>
                  <p className="text-sm font-medium">Save</p>
                </div>
                 <div className="text-center">
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full mb-1">
                    <Star className="h-6 w-6"/>
                  </Button>
                  <p className="text-sm font-medium">Favorite</p>
                </div>
              </div>
              <Separator />
              <div className="mt-6">
                <h3 className="font-headline text-xl font-bold mb-4">Cooking Tips</h3>
                <ul className="space-y-3 text-sm">
                  {recipe.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <Star className="h-4 w-4 text-primary/80 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </aside>
        </div>

        <Separator className="my-12" />

        <section id="comments">
          <h2 className="font-headline text-2xl md:text-3xl font-bold mb-6">
            {recipe.comments.length} Comments
          </h2>
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={users[0].avatarUrl} />
                  <AvatarFallback>{users[0].name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="w-full">
                  <Textarea placeholder="Add a comment..." />
                  <Button className="mt-4">Post Comment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            {recipe.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
                  <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{comment.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                       {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p>{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
