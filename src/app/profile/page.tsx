import { redirect } from 'next/navigation';

import { RecipeCard } from '@/components/recipe-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLatestRecipes } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

type ProfileRow = {
  name: string | null;
  avatar_url: string | null;
};

function getInitials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

export default async function ProfilePage() {
  const supabaseReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  if (!supabaseReady) {
    redirect('/login?error=Add%20your%20Supabase%20env%20vars%20first.');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/profile');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  const displayName =
    profile?.name?.trim() ||
    user.user_metadata.name?.trim() ||
    user.email?.split('@')[0] ||
    'Cook';
  const avatarUrl = profile?.avatar_url || user.user_metadata.avatar_url || '';
  const savedRecipes = getLatestRecipes(4);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <header className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8 md:mb-12 bg-card p-8 border shadow-paper">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/20">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-4xl">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="font-headline text-4xl md:text-5xl">{displayName}</h1>
          <p className="text-muted-foreground mt-2 text-lg">{user.email}</p>
          <p className="text-muted-foreground mt-1">
            Your account is now connected to Supabase.
          </p>
        </div>
      </header>

      <Card className="mb-8">
        <CardContent className="grid gap-2 p-6 text-sm text-muted-foreground">
          <p>
            Profile records are coming from your `profiles` table and your auth
            session is coming from Supabase.
          </p>
          <p>
            Saved recipes are still sample data for now, so auth is working
            without forcing a full content migration yet.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="saved">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto">
          <TabsTrigger value="saved">Saved Recipes</TabsTrigger>
          <TabsTrigger value="favorited">Favorited</TabsTrigger>
        </TabsList>
        <TabsContent value="saved">
          <div className="p-1">
            {savedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border shadow-paper">
                <h3 className="text-lg font-semibold">No Saved Recipes Yet</h3>
                <p className="text-muted-foreground mt-1">
                  Start exploring and save your favorites.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="favorited">
          <div className="text-center py-12 bg-card border shadow-paper">
            <h3 className="text-lg font-semibold">No Favorited Recipes</h3>
            <p className="text-muted-foreground mt-1">
              Your most-loved recipes will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
