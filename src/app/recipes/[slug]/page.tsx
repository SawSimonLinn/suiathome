import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getRecipeBySlug } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const recipe = getRecipeBySlug(params.slug);

  if (!recipe) {
    notFound();
  }

  const coverImage = PlaceHolderImages.find((p) => p.id === recipe.imageId);

  return (
    <div className="py-8 md:py-12">
      <article>
        <header className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4 !font-body font-semibold">{recipe.category.name}</Badge>
          <h1 className="font-headline text-4xl md:text-6xl font-bold !leading-tight tracking-tight mb-4">
            {recipe.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-semibold">{recipe.description}</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Avatar className="border-2 border-accent">
              <AvatarImage src={recipe.author.avatarUrl} alt={recipe.author.name} />
              <AvatarFallback>{recipe.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold">{recipe.author.name}</p>
              <p className="text-sm text-muted-foreground">
                Posted on {new Date(recipe.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

        <Card className="overflow-hidden mb-8 border border-primary shadow-[8px_8px_0px_hsl(var(--primary))]">
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
        
        <Card className="mb-8 border">
            <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm font-bold">Prep Time</p>
                        <p className="text-sm text-muted-foreground">{recipe.prepTime}</p>
                    </div>
                    <div>
                        <p className="text-sm font-bold">Cook Time</p>
                        <p className="text-sm text-muted-foreground">{recipe.cookTime}</p>
                    </div>
                    <div>
                        <p className="text-sm font-bold">Servings</p>
                        <p className="text-sm text-muted-foreground">{recipe.servings}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="prose prose-lg max-w-none text-foreground prose-headings:font-headline prose-headings:text-foreground mb-8 text-center">
            <p className="lead bg-accent/20 p-6 rounded-lg border border-accent font-semibold">{recipe.story}</p>
        </div>

        <div className="space-y-8">
            <Card className="border">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl md:text-4xl font-bold flex items-center gap-3">
                        Ingredients
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3 font-semibold">
                        {recipe.ingredients.map((ing, index) => (
                        <li key={index} className="flex gap-3 items-start p-2 rounded-md bg-secondary/30">
                            <span className="text-primary font-bold text-lg mt-0.5">&gt;</span>
                            <div>
                            <span>{ing.quantity}</span>
                            <span className="text-muted-foreground"> {ing.name}</span>
                            </div>
                        </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            
            <Card className="border">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl md:text-4xl font-bold flex items-center gap-3">
                         Instructions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="list-none space-y-6">
                        {recipe.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-bold font-headline text-2xl text-primary border border-primary">
                            {index + 1}
                            </div>
                            <p className="pt-1.5 font-semibold">{step}</p>
                        </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>
        </div>
        
        <Separator className="my-12" />

        <div className="flex justify-center items-center gap-4 md:gap-8 mb-12">
            <Button variant="outline" size="lg">
              Likes ({recipe.likes})
            </Button>
            <Button variant="outline" size="lg">
              Save
            </Button>
            <Button variant="outline" size="lg">
              Favorite
            </Button>
        </div>

      </article>
    </div>
  );
}
