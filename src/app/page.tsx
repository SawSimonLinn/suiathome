import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/recipe-card';
import { RecipesCarousel } from '@/components/recipes-carousel';
import { getHomepageRecipes } from '@/lib/supabase/public-recipes';
import { getTopTriedItPosts } from '@/lib/supabase/public-community';
import { TriedItCarousel } from '@/components/tried-it-carousel';

export default async function Home() {
  const [{ latestRecipes, popularRecipes }, triedItPosts] = await Promise.all([
    getHomepageRecipes(),
    getTopTriedItPosts(10),
  ]);

  return (
    <div className="flex flex-col py-8 md:py-12">
      <section className="w-full text-center py-12 md:py-24 relative overflow-hidden">

        {/* Floating botanical side decorations */}
        <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-between px-2 sm:px-8 md:px-12" aria-hidden="true">
          <div className="flex flex-col gap-5 text-3xl sm:text-4xl opacity-40">
            <span>🌸</span>
            <span>🌿</span>
            <span>🌷</span>
            <span>🪴</span>
          </div>
          <div className="flex flex-col gap-5 text-3xl sm:text-4xl opacity-40">
            <span>🌺</span>
            <span>🌱</span>
            <span>💐</span>
            <span>🫙</span>
          </div>
        </div>

        <div className="mx-auto max-w-3xl border-2 border-foreground paper-shadow relative" style={{ backgroundColor: 'var(--cream-warm)' }}>

          {/* Sage green top ribbon */}
          <div className="w-full border-b-2 border-foreground py-2 px-4 flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--sage)' }}>
            <span className="text-sm font-medium tracking-widest uppercase" style={{ color: '#2d4a2a' }}>
              🌿 &nbsp; Homemade with love &nbsp; 🌿
            </span>
          </div>

          <div className="p-6 sm:p-10">
            {/* Tape strips */}
            <div className="absolute top-[3.2rem] left-6 w-14 h-5 border border-foreground opacity-70 rotate-[-3deg]" style={{ backgroundColor: 'var(--brass)', opacity: 0.6 }} />
            <div className="absolute top-[3.2rem] right-8 w-12 h-5 border border-foreground opacity-70 rotate-[2deg]" style={{ backgroundColor: 'var(--blush)' }} />

            {/* Blush flower accent row */}
            <div className="flex justify-center gap-2 mb-4" aria-hidden="true">
              {['🌸','🌼','🌸','🌼','🌸'].map((f, i) => (
                <span key={i} className="text-xl">{f}</span>
              ))}
            </div>

            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl leading-tight" style={{ color: '#2d4a2a' }}>
              Sui at Home
            </h1>

            {/* Sage squiggly underline */}
            <div className="mt-3 flex justify-center">
              <svg width="180" height="12" viewBox="0 0 180 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 8 Q14 2 26 8 Q38 14 50 8 Q62 2 74 8 Q86 14 98 8 Q110 2 122 8 Q134 14 146 8 Q158 2 170 8 Q176 11 178 8" stroke="var(--sage-dark)" strokeWidth="3" strokeLinecap="round" fill="none"/>
              </svg>
            </div>

            <p className="mt-5 sm:mt-6 max-w-xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed" style={{ color: '#4a5e47' }}>
              From our kitchen to yours — recipes crafted with love, steeped in tradition, and made to be shared.
            </p>

            {/* Lavender stripe divider */}
            <div className="mx-auto mt-7 mb-7 h-[3px] w-24 border-0" style={{ backgroundColor: 'var(--lavender)' }} />

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="border-2 border-foreground paper-btn font-semibold" style={{ backgroundColor: 'var(--sage)', color: '#1f3b1c' }}>
                <Link href="/recipes">
                  🍽️ Explore Recipes
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-foreground paper-btn font-semibold" style={{ backgroundColor: 'var(--blush-light)', color: '#5c2d3a' }}>
                <Link href="/community">
                  💌 See What&apos;s Cooking
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-xs italic" style={{ color: 'var(--sage-dark)' }}>✨ new recipes every week</p>
          </div>

          {/* Bottom floral strip */}
          <div className="w-full border-t-2 border-foreground py-2 flex justify-center gap-3 text-lg" style={{ backgroundColor: 'var(--blush-light)' }} aria-hidden="true">
            <span>🌷</span><span>🌿</span><span>🫶</span><span>🌿</span><span>🌷</span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl">Newest Creations</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Discover the latest additions to our collection, fresh from the kitchen!</p>
        </div>
        {latestRecipes.length > 3 ? (
          <RecipesCarousel recipes={latestRecipes} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {latestRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Button asChild variant="outline">
            <Link href="/recipes">🍽️ View All Recipes</Link>
          </Button>
        </div>
      </section>
      
      <section className="py-12 mt-8">
        <div className="text-center mb-12 px-4">
          <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl">Tried It!</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            See what our community is cooking — real attempts at our chef recipes, sorted by most loved.
          </p>
        </div>
        {triedItPosts.length > 3 ? (
          <TriedItCarousel posts={triedItPosts} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {triedItPosts.map((post) => {
              const STICKERS = ['🍳', '🥘', '🫕', '🥗', '🍜', '🧆', '🥙', '🍲', '🥣', '🍱'];
              const TAPE_COLORS = ['var(--brass)', 'var(--blush)', 'var(--sage)', 'var(--lavender)'];
              const code = post.id.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
              const sticker = STICKERS[code % STICKERS.length];
              const tapeColor = TAPE_COLORS[code % TAPE_COLORS.length];
              const tapeRot = (code % 2 === 0 ? 1 : -1) * (1 + (code % 4));
              const stickerRot = (code % 2 === 0 ? 1 : -1) * (6 + (code % 10));
              return (
                <div key={post.id} className="border-2 border-foreground bg-paper paper-shadow flex flex-col overflow-hidden relative">
                  {/* Tape strip */}
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 border border-foreground/60 z-10"
                    style={{ backgroundColor: tapeColor, opacity: 0.65, rotate: `${tapeRot}deg` }}
                    aria-hidden="true"
                  />
                  {post.imageUrl ? (
                    <div className="aspect-square overflow-hidden bg-secondary/20 relative">
                      <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" loading="lazy" />
                      <span
                        className="absolute bottom-2 right-2 text-2xl select-none pointer-events-none drop-shadow-sm"
                        style={{ rotate: `${stickerRot}deg` }}
                        aria-hidden="true"
                      >{sticker}</span>
                    </div>
                  ) : (
                    <div className="aspect-square bg-secondary/20 flex items-center justify-center">
                      <span className="text-4xl" aria-hidden="true">{sticker}</span>
                    </div>
                  )}
                  <div className="p-4">
                    <svg width="100%" height="8" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden="true" className="mb-2">
                      <path d="M0 4 Q10 1 20 4 Q30 7 40 4 Q50 1 60 4 Q70 7 80 4 Q90 1 100 4 Q110 7 120 4 Q130 1 140 4 Q150 7 160 4 Q170 1 180 4 Q190 7 200 4" stroke="var(--sage-dark, #4a7a40)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3"/>
                    </svg>
                    <p className="text-sm line-clamp-3">{post.caption}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="text-center mt-10">
          <Button asChild variant="outline">
            <Link href="/community">💌 See All Community Posts</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
