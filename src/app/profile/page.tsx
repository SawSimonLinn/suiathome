import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { users, getLatestRecipes } from "@/lib/data";
import { RecipeCard } from "@/components/recipe-card";

export default function ProfilePage() {
  // Placeholder user
  const user = users[0];
  const savedRecipes = getLatestRecipes(4);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <header className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8 md:mb-12">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/20">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback className="text-4xl">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">
            {user.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personal recipe collection.
          </p>
          <Button variant="outline" className="mt-4">
            Edit Profile
          </Button>
        </div>
      </header>

      <Tabs defaultValue="saved">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto">
          <TabsTrigger value="saved">Saved Recipes</TabsTrigger>
          <TabsTrigger value="favorited">Favorited</TabsTrigger>
        </TabsList>
        <TabsContent value="saved">
          <Card>
            <CardContent className="p-4 md:p-6">
              {savedRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold">No Saved Recipes Yet</h3>
                  <p className="text-muted-foreground mt-1">Start exploring and save your favorites!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="favorited">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold">No Favorited Recipes</h3>
                <p className="text-muted-foreground mt-1">Your most-loved recipes will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
