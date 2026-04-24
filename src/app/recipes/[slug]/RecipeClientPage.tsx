"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useRecipeInteractions } from "@/hooks/use-recipe-interactions";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Heart, Bookmark, Share2 } from "lucide-react";
import Link from "next/link";
import { CommunityPostCard } from "@/components/community-post-card";
import { CreateCommunityPostCard } from "@/components/create-community-post-card";
import { RecipeCoverCarousel } from "@/components/recipe-cover-carousel";
import { RecipeTipsPanel } from "@/components/recipe-tips-panel";
import { RecipeQaSection } from "./RecipeQaSection";
import type { Recipe, CommunityPost, User } from "@/lib/types";

interface RecipeClientPageProps {
  recipe: Recipe;
  relatedPosts: CommunityPost[];
  relatedRecipes: Recipe[];
  currentUser: User | null;
}

const SECTION_FLOWERS = ["🌸", "🌼", "🌸", "🌼", "🌸"];

function getReelPlatform(url: string): "instagram" | "facebook" | "other" {
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("facebook.com") || url.includes("fb.watch"))
    return "facebook";
  return "other";
}

function getEmbedUrl(
  url: string,
  platform: "instagram" | "facebook" | "other",
): string | null {
  if (platform === "instagram") {
    const [base] = url.split("?");
    return base.replace(/\/$/, "") + "/embed/";
  }
  if (platform === "facebook") {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&mute=0`;
  }
  return null;
}

function ReelPlayer({ url }: { url: string }) {
  const platform = getReelPlatform(url);
  const embedUrl = getEmbedUrl(url, platform);

  if (!embedUrl) {
    return (
      <div
        className="relative border-2 border-foreground paper-shadow-sm overflow-hidden"
        style={{ backgroundColor: "#000" }}
      >
        <video
          src={url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full max-h-[480px] object-contain"
        />
      </div>
    );
  }

  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    iframeRef.current?.setAttribute("scrolling", "no");
  }, []);

  return (
    <div
      className="border-2 border-foreground paper-shadow-sm flex flex-col items-center py-4 gap-3"
      style={{ backgroundColor: "var(--cream-warm)" }}
    >
      <div style={{ width: 320, height: 550, overflow: "hidden" }}>
        <iframe
          ref={iframeRef}
          src={embedUrl}
          width={320}
          height={700}
          style={{ border: "none", display: "block" }}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          title="Recipe reel"
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs underline text-muted-foreground hover:text-foreground transition-colors"
      >
        Open in{" "}
        {platform === "instagram"
          ? "Instagram"
          : platform === "facebook"
            ? "Facebook"
            : "browser"}{" "}
        ↗
      </a>
    </div>
  );
}

function ReelSection({ reelUrl }: { reelUrl: string }) {
  return (
    <section>
      <h2 className="font-headline text-2xl flex items-center gap-2 mb-4">
        Watch it Cook{" "}
        <span className="text-xl" aria-hidden="true">
          🎥
        </span>
      </h2>
      <ReelPlayer url={reelUrl} />
    </section>
  );
}

function SquigglyLine({
  width = 180,
  opacity = 0.5,
}: {
  width?: number;
  opacity?: number;
}) {
  return (
    <svg
      width={width}
      height="12"
      viewBox={`0 0 ${width} 12`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={`M2 8 ${Array.from({ length: Math.floor(width / 12) }, (_, i) => {
          const x1 = 2 + i * 12;
          const x2 = x1 + 6;
          const x3 = x2 + 6;
          const y = i % 2 === 0 ? 2 : 10;
          return `Q${x2} ${y} ${x3} 8`;
        }).join(" ")}`}
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
        await supabase.from("recipe_views").insert({ recipe_id: recipe.id });
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
    recipePathId: recipe.id,
    recipeTitle: recipe.title,
    initialLikeCount: recipe.likes,
    initialFavoriteCount: recipe.favorites,
    initialLiked: recipe.isLiked ?? false,
    initialFavorited: recipe.isFavorited ?? false,
  });

  const coverImage = recipe.imageUrl
    ? {
        imageUrl: recipe.imageUrl,
        imageHint: recipe.imageHint || "recipe photo",
      }
    : PlaceHolderImages.find((p) => p.id === recipe.imageId);

  return (
    <div className="py-8 md:py-12">
      <article className="mx-auto max-w-7xl border-2 border-foreground bg-paper paper-shadow relative">
        {/* Top ribbon */}
        <div
          className="w-full border-b-2 border-foreground py-2 px-4 flex items-center justify-center gap-2 relative"
          style={{ backgroundColor: "var(--sage)" }}
        >
          <span
            className="text-sm font-medium tracking-widest uppercase"
            style={{ color: "#2d4a2a" }}
          >
            🌿 &nbsp; Homemade with love &nbsp; 🌿
          </span>
        </div>

        {/* ── Twitter-style 3-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_260px]">
          {/* ══ LEFT: Recipe profile panel ══ */}
          <aside
            className="border-b-2 lg:border-b-0 lg:border-r-2 border-foreground px-5 md:pl-6 md:pr-2"
            style={{ backgroundColor: "var(--cream-warm)" }}
          >
            <div className="themed-scrollbar lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto pb-6 pr-4">
              {/* Flowers + Title */}
              <div className="pt-6 pb-5 border-b border-foreground/15">
                <div className="flex gap-1.5 mb-3" aria-hidden="true">
                  {SECTION_FLOWERS.map((f, i) => (
                    <span key={i} className="text-sm">
                      {f}
                    </span>
                  ))}
                </div>
                <h1
                  className="font-headline text-2xl md:text-3xl !leading-tight tracking-tight"
                  style={{ color: "#2d4a2a" }}
                >
                  {recipe.title}
                </h1>
                <div className="mt-2 mb-3">
                  <SquigglyLine width={140} opacity={0.45} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {recipe.description}
                </p>
              </div>

              {/* Author */}
              <div className="py-5 border-b border-foreground/15">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 border-2 border-foreground shrink-0">
                    <AvatarImage
                      src={recipe.author.avatarUrl}
                      alt={recipe.author.name}
                    />
                    <AvatarFallback>
                      {recipe.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {recipe.author.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(recipe.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="border border-foreground/20 text-xs tracking-widest uppercase"
                  >
                    {recipe.category.name}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" /> {viewCount}{" "}
                    {viewCount === 1 ? "view" : "views"}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="py-5 border-b border-foreground/15">
                <div className="grid grid-cols-3 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                      Prep
                    </p>
                    <p className="font-bold text-sm mt-1">{recipe.prepTime}</p>
                  </div>
                  <div className="border-x border-foreground/15">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                      Cook
                    </p>
                    <p className="font-bold text-sm mt-1">{recipe.cookTime}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                      Serves
                    </p>
                    <p className="font-bold text-sm mt-1">{recipe.servings}</p>
                  </div>
                </div>
              </div>

              {/* Admin edit */}
              {currentUser?.role === "admin" && (
                <div className="py-4 border-b border-foreground/15">
                  <Link
                    href={`/admin/recipes/${recipe.id}/edit`}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold border-2 border-foreground px-3 py-1.5 paper-btn w-full"
                    style={{
                      backgroundColor: "var(--brass)",
                      color: "#2d4a2a",
                    }}
                  >
                    <Pencil className="h-3 w-3" /> Edit Recipe
                  </Link>
                </div>
              )}

              {/* Related recipes */}
              {relatedRecipes.length > 0 && (
                <div className="pt-5">
                  <h2 className="font-headline text-lg mb-1">
                    You May Also Like
                  </h2>
                  <div className="mb-4">
                    <SquigglyLine width={110} opacity={0.4} />
                  </div>
                  <div className="flex flex-col gap-3">
                    {relatedRecipes.map((r) => (
                      <Link
                        key={r.id}
                        href={`/recipes/${r.slug}`}
                        className="group flex items-center gap-3 border-2 border-foreground paper-shadow-sm overflow-hidden hover:bg-foreground/5 transition-colors"
                        style={{ backgroundColor: "var(--paper)" }}
                      >
                        <div className="relative w-16 h-16 shrink-0 border-r-2 border-foreground overflow-hidden">
                          {r.imageUrl ? (
                            <Image
                              src={r.imageUrl}
                              alt={r.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-2xl"
                              style={{ backgroundColor: "var(--blush)" }}
                            >
                              🍽️
                            </div>
                          )}
                        </div>
                        <div className="py-2 pr-2 min-w-0">
                          <p className="text-xs font-semibold leading-snug line-clamp-2 font-headline">
                            {r.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {r.category.name}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ══ CENTER: Content feed ══ */}
          <main className="min-w-0 border-b-2 lg:border-b-0 border-foreground">
            {/* Carousel — full bleed at top of center column */}
            {coverImage && (
              <RecipeCoverCarousel
                compact
                images={[
                  {
                    src: coverImage.imageUrl,
                    alt: recipe.title,
                    objectPosition: recipe.coverPosition ?? "center center",
                  },
                  ...(recipe.galleryImages ?? []).map((img, i) => ({
                    src: img.url,
                    alt: `${recipe.title} photo ${i + 2}`,
                  })),
                ]}
              />
            )}

            <div className="p-5 md:p-7 space-y-8">
              {/* Story */}
              {recipe.story && (
                <div
                  className="border-2 border-foreground p-4 paper-shadow-sm relative"
                  style={{ backgroundColor: "var(--blush-light)" }}
                >
                  <div
                    className="absolute -top-2 left-6 w-10 h-4 border border-foreground/60 rotate-[2deg]"
                    style={{ backgroundColor: "var(--lavender)", opacity: 0.8 }}
                    aria-hidden="true"
                  />
                  <h2 className="font-headline text-lg flex items-center gap-1.5 mb-2">
                    The Story <span aria-hidden="true">📖</span>
                  </h2>
                  <p className="italic leading-relaxed text-sm text-foreground/90">
                    {recipe.story}
                  </p>
                  {/* Like / Favorite / Share */}
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-foreground/15">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void toggleLike()}
                      disabled={pendingAction === "like"}
                      className={`flex items-center gap-1.5 font-semibold ${isLiked ? "text-rose-600" : ""}`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-600" : ""}`} />
                      <span className="text-sm">{likeCount}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void toggleFavorite()}
                      disabled={pendingAction === "favorite"}
                      className={`flex items-center gap-1.5 font-semibold ${isFavorited ? "text-amber-600" : ""}`}
                    >
                      <Bookmark className={`h-4 w-4 ${isFavorited ? "fill-amber-600" : ""}`} />
                      <span className="text-sm">{favoriteCount}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void shareRecipe()}
                      disabled={isSharing}
                      className="flex items-center gap-1.5 font-semibold"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm">{isSharing ? "Sharing…" : "Share"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div>
                <h2 className="mb-1 font-headline text-2xl flex items-center gap-2">
                  Instructions <span aria-hidden="true">📝</span>
                </h2>
                <div className="mb-5">
                  <SquigglyLine width={150} opacity={0.45} />
                </div>
                <ol className="list-none space-y-5 text-base leading-loose">
                  {recipe.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="mt-1.5 flex h-7 w-7 flex-shrink-0 items-center justify-center border-2 border-foreground font-bold font-headline text-base">
                        {index + 1}
                      </div>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Reel */}
              {recipe.reelUrl && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <SquigglyLine width={80} opacity={0.4} />
                    <span aria-hidden="true">🎬</span>
                    <SquigglyLine width={80} opacity={0.4} />
                  </div>
                  <ReelSection reelUrl={recipe.reelUrl} />
                </div>
              )}
            </div>

          </main>

          {/* ══ RIGHT: Ingredients + Tips ══ */}
          <aside
            className="lg:border-l-2 border-foreground p-5 md:pl-6 md:pr-2 py-6"
            style={{ backgroundColor: "var(--blush-light)" }}
          >
            <div className="themed-scrollbar lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto pb-4 pr-4">
              {/* Ingredients */}
              <div className="py-4">
                <h2 className="font-headline text-2xl flex items-center gap-2 mb-1">
                  Ingredients <span aria-hidden="true">🥕</span>
                </h2>
                <div className="mb-4">
                  <SquigglyLine width={130} opacity={0.45} />
                </div>
                <ul className="space-y-2 text-sm">
                  {recipe.ingredients.map((ing, index) => (
                    <li
                      key={index}
                      className="flex gap-2 items-start border-b border-foreground/10 pb-2"
                    >
                      <span className="text-foreground/30 text-xs mt-0.5 shrink-0">
                        ✦
                      </span>
                      <div>
                        {ing.quantity && ing.quantity !== "to taste" && (
                          <span className="font-semibold">{ing.quantity} </span>
                        )}
                        <span className="text-muted-foreground">
                          {ing.name}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              {recipe.tips.length > 0 && (
                <div className="py-4 border-t border-foreground/15">
                  <h2 className="font-headline text-2xl flex items-center gap-2 mb-1">
                    Tips{" "}
                    <span className="text-lg" aria-hidden="true">
                      💡
                    </span>
                  </h2>
                  <div className="mb-4">
                    <SquigglyLine width={100} opacity={0.45} />
                  </div>
                  <RecipeTipsPanel tips={recipe.tips} />
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Bottom floral strip */}
        <div
          className="w-full border-t-2 border-foreground py-2 flex justify-center gap-3 text-lg"
          style={{ backgroundColor: "var(--blush-light)" }}
          aria-hidden="true"
        >
          <span>🌷</span>
          <span>🌿</span>
          <span>🫶</span>
          <span>🌿</span>
          <span>🌷</span>
        </div>
      </article>

      {/* Q&A */}
      <div className="max-w-7xl mx-auto mt-12 px-4">
        <RecipeQaSection
          recipeId={recipe.id}
          initialComments={recipe.comments}
          currentUser={currentUser}
        />
      </div>

      {/* Community Creations */}
      <section className="max-w-7xl mx-auto mt-16 px-4">
        <div className="text-center mb-8">
          <h2
            className="font-headline text-3xl md:text-4xl"
            style={{ color: "#2d4a2a" }}
          >
            Community Creations
          </h2>
          <div className="flex justify-center mt-3">
            <SquigglyLine width={160} opacity={0.45} />
          </div>
          <div className="flex justify-center gap-2 mt-2" aria-hidden="true">
            {["🍳", "🥘", "🫕"].map((e, i) => (
              <span key={i} className="text-lg">
                {e}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:overflow-x-auto md:pb-4 md:snap-x md:snap-mandatory">
          {relatedPosts.map((post) => (
            <div
              key={post.id}
              className="w-full md:w-[min(88vw,420px)] md:shrink-0 md:snap-start"
            >
              <CommunityPostCard post={post} currentUser={currentUser} />
            </div>
          ))}
          <div className="w-full md:w-[min(88vw,420px)] md:shrink-0 md:snap-start">
            <CreateCommunityPostCard
              recipeId={recipe.id}
              recipeTitle={recipe.title}
              currentUser={currentUser}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
