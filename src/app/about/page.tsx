import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RestaurantVote } from "./restaurant-vote";
import { AdSlot } from "@/components/ad-slot";

const ABOUT_TITLE = "About Sui | Burmese Home Cooking Story | Sui at home";
const ABOUT_DESCRIPTION =
  "Learn about Sui, a Burmese home cook from Thangtlang, Chin State, Myanmar, and Yangon sharing authentic Myanmar recipes, family food stories, and her restaurant dream in the USA.";

export const metadata: Metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  keywords: [
    "about Sui at home",
    "about Sui",
    "Burmese recipes",
    "Myanmar food",
    "Burmese home cooking",
    "Sui cooking story",
    "Thangtlang Chin State",
    "Yangon food culture",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    url: "/about",
    siteName: "Sui at home",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col py-6 md:py-12 gap-8 md:gap-16">
      {/* ── Hero ── */}
      <section className="w-full text-center py-6 md:py-20 relative overflow-hidden">
        {/* Floating side decorations */}
        <div
          className="pointer-events-none select-none absolute inset-0 hidden sm:flex items-center justify-between sm:px-4 md:px-12"
          aria-hidden="true"
        >
          <div className="flex flex-col gap-5 text-3xl sm:text-4xl opacity-40">
            <span>🌸</span>
            <span>🏡</span>
            <span>🌿</span>
            <span>🫙</span>
          </div>
          <div className="flex flex-col gap-5 text-3xl sm:text-4xl opacity-40">
            <span>🌺</span>
            <span>🍜</span>
            <span>🌱</span>
            <span>💐</span>
          </div>
        </div>

        <div
          className="mx-auto max-w-3xl border-2 border-foreground paper-shadow relative"
          style={{ backgroundColor: "var(--cream-warm)" }}
        >
          <div
            className="w-full border-b-2 border-foreground py-2 px-4 flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--sage)" }}
          >
            <span
              className="text-sm font-medium tracking-widest uppercase"
              style={{ color: "#2d4a2a" }}
            >
              🌿 &nbsp; Meet Sui &nbsp; 🌿
            </span>
          </div>

          <div className="p-4 sm:p-10 relative">
            {/* Tape strips */}
            <div
              className="absolute top-[3.2rem] left-6 w-14 h-5 border border-foreground opacity-70 rotate-[-3deg]"
              style={{ backgroundColor: "var(--brass)", opacity: 0.6 }}
            />
            <div
              className="absolute top-[3.2rem] right-8 w-12 h-5 border border-foreground opacity-70 rotate-[2deg]"
              style={{ backgroundColor: "var(--blush)" }}
            />

            <div className="flex justify-center gap-2 mb-4" aria-hidden="true">
              {["🌸", "🌼", "🌸", "🌼", "🌸"].map((f, i) => (
                <span key={i} className="text-xl">
                  {f}
                </span>
              ))}
            </div>

            <h1
              className="font-headline text-4xl sm:text-5xl md:text-6xl leading-tight"
              style={{ color: "#2d4a2a" }}
            >
              About Sui
            </h1>

            <div className="mt-3 flex justify-center">
              <svg
                width="160"
                height="12"
                viewBox="0 0 160 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 8 Q12 2 22 8 Q32 14 42 8 Q52 2 62 8 Q72 14 82 8 Q92 2 102 8 Q112 14 122 8 Q132 2 142 8 Q150 11 158 8"
                  stroke="var(--sage-dark)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>

            <p
              className="mt-5 max-w-xl mx-auto text-base sm:text-lg leading-relaxed"
              style={{ color: "#4a5e47" }}
            >
              Sui is a Burmese home cook, born in Thangtlang, Chin State,
              Myanmar, and raised in Yangon, now sharing authentic Myanmar
              recipes and family food memories in the USA.
            </p>
            <p
              className="mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
              style={{ color: "#4a5e47" }}
            >
              She is the creator of Sui at home, a food community focused on
              Burmese recipes, practical home cooking, and preserving Myanmar
              culinary heritage.
            </p>

            <div
              className="mx-auto mt-6 mb-6 h-[3px] w-24"
              style={{ backgroundColor: "var(--lavender)" }}
            />

            <div
              className="flex flex-wrap justify-center gap-4 text-sm font-semibold"
              style={{ color: "#2d4a2a" }}
            >
              <span
                className="border-2 border-foreground px-3 py-1 paper-shadow-sm"
                style={{ backgroundColor: "var(--sage-light)" }}
              >
                🏔️ Born in Thangtlang
              </span>
              <span
                className="border-2 border-foreground px-3 py-1 paper-shadow-sm"
                style={{ backgroundColor: "var(--blush-light)" }}
              >
                🌆 Raised in Yangon
              </span>
              <span
                className="border-2 border-foreground px-3 py-1 paper-shadow-sm"
                style={{ backgroundColor: "var(--lavender)" }}
              >
                ✈️ Living in USA
              </span>
              <span
                className="border-2 border-foreground px-3 py-1 paper-shadow-sm"
                style={{ backgroundColor: "var(--brass)", color: "#2d1a00" }}
              >
                🎬 10K+ Followers
              </span>
            </div>
          </div>

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
        </div>
      </section>

      {/* Banner ad — below hero */}
      <AdSlot variant="leaderboard" />

      {/* ── Story cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {[
          {
            emoji: "🏔️",
            title: "Roots",
            tape: "var(--brass)",
            bg: "var(--sage-light)",
            body: "Sui was born in Thangtlang, a town in Chin State, Myanmar. From a young age she grew up surrounded by the bold, earthy flavors that define Chin and Burmese home cooking.",
          },
          {
            emoji: "🌆",
            title: "Yangon Years",
            tape: "var(--blush)",
            bg: "var(--blush-light)",
            body: "She spent her formative years in Yangon, the vibrant heart of Myanmar, where street food culture, night markets, and family recipes shaped her love for cooking. Yangon still lives in every dish she makes.",
          },
          {
            emoji: "🍳",
            title: "Cooking for Family",
            tape: "var(--lavender)",
            bg: "var(--cream-warm)",
            body: "In the USA, Sui cooks for her family almost every single day. What started as love for her family quickly became something much bigger: in 2026 she began recording, and within just a couple of months gained 10,000+ followers who can't get enough.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="relative border-2 border-foreground paper-shadow"
            style={{ backgroundColor: card.bg }}
          >
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-5 border border-foreground/60 z-10"
              style={{ backgroundColor: card.tape, opacity: 0.75 }}
              aria-hidden="true"
            />
            <div className="p-6 pt-7 flex flex-col gap-3">
              <span className="text-3xl">{card.emoji}</span>
              <h3
                className="font-headline text-xl"
                style={{ color: "#2d4a2a" }}
              >
                {card.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4a5e47" }}
              >
                {card.body}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Inline ad — between story cards and "What Drives Her" */}
      <AdSlot variant="inline" />

      {/* ── What she loves ── */}
      <section
        className="border-2 border-foreground paper-shadow"
        style={{ backgroundColor: "var(--cream-warm)" }}
      >
        <div
          className="border-b-2 border-foreground px-6 py-3"
          style={{ backgroundColor: "var(--sage)" }}
        >
          <h2
            className="font-headline text-2xl sm:text-3xl"
            style={{ color: "#1f3b1c" }}
          >
            🍜 What Drives Her
          </h2>
        </div>
        <div className="p-4 sm:p-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <div className="flex flex-col gap-3">
            <h3 className="font-headline text-lg" style={{ color: "#2d4a2a" }}>
              Brands & Collabs
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#4a5e47" }}>
              Sui has started partnering with brands that share her values and
              create products that belong in a real home kitchen. Every
              collaboration is personal and honest, just like her cooking.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-headline text-lg" style={{ color: "#2d4a2a" }}>
              Trying New Foods
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#4a5e47" }}>
              Sui loves exploring new cuisines and ingredients. Whether
              it&apos;s a market she&apos;s never been to or a dish she&apos;s
              curious about, she tries it, she eats it, and she&apos;ll probably
              cook it next.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-headline text-lg" style={{ color: "#2d4a2a" }}>
              Follower Recipes
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#4a5e47" }}>
              This website exists because her followers asked for it. Every
              recipe here was requested by real people who watched her cook and
              wanted to try it themselves. That means everything to her.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-headline text-lg" style={{ color: "#2d4a2a" }}>
              Myanmar Heritage
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#4a5e47" }}>
              Burmese food is deeply underrepresented in the world. Sui is on a
              mission to change that, one mohinga, one lahpet thoke, one
              perfectly spiced curry at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Ad — between "What Drives Her" and Restaurant Dream */}
      <AdSlot variant="inline" />

      {/* ── Restaurant Dream ── */}
      <section
        className="border-2 border-foreground paper-shadow-lg relative overflow-hidden"
        style={{ backgroundColor: "var(--cream-warm)" }}
      >
        {/* Decorative corner stickers */}
        <div
          className="pointer-events-none select-none absolute top-4 right-4 text-4xl opacity-30"
          aria-hidden="true"
        >
          🏮
        </div>
        <div
          className="pointer-events-none select-none absolute bottom-4 left-4 text-4xl opacity-30"
          aria-hidden="true"
        >
          🌸
        </div>

        <div
          className="border-b-2 border-foreground px-6 py-4"
          style={{ backgroundColor: "var(--brass)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <h2
                className="font-headline text-2xl sm:text-3xl"
                style={{ color: "#2d1a00" }}
              >
                The Dream: A Burmese Kitchen
              </h2>
              <p
                className="text-sm font-medium mt-0.5"
                style={{ color: "#5a3600" }}
              >
                Yangon-themed · Myanmar-inspired · Made with love
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-10 flex flex-col gap-6 sm:gap-8">
          <p
            className="text-base sm:text-lg leading-relaxed max-w-2xl"
            style={{ color: "#4a5e47" }}
          >
            Sui&apos;s biggest dream is to open her own restaurant: a{" "}
            <strong>Burmese kitchen</strong> decorated in the spirit of{" "}
            <strong>Yangon, Myanmar</strong>. Lanterns, warm wood, the smells of
            mohinga and tea leaf salad. A place where every guest feels the
            warmth of a Myanmar home.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: "🏮", label: "Yangon-themed interior" },
              { emoji: "🫕", label: "Traditional Burmese menu" },
              { emoji: "🫶", label: "Community gathering space" },
            ].map((item) => (
              <div
                key={item.label}
                className="border-2 border-foreground px-4 py-4 flex items-center gap-3 paper-shadow-sm"
                style={{ backgroundColor: "var(--sage-light)" }}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#2d4a2a" }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t-2 border-foreground" />

          {/* Voting section */}
          <div>
            <div className="mb-5">
              <h3
                className="font-headline text-2xl sm:text-3xl"
                style={{ color: "#2d4a2a" }}
              >
                Where should she open?
              </h3>
              <p className="text-sm mt-1" style={{ color: "#6a9165" }}>
                Help Sui decide, and cast your vote for the city you&apos;d love
                to visit her restaurant in.
              </p>
            </div>
            <RestaurantVote />
          </div>
        </div>
      </section>

      {/* Inline ad — before CTA */}
      <AdSlot variant="leaderboard" />

      {/* ── CTA ── */}
      <section className="text-center py-4 md:py-8">
        <p
          className="font-headline text-2xl sm:text-3xl mb-6"
          style={{ color: "#2d4a2a" }}
        >
          Follow Sui&apos;s journey
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            size="lg"
            className="border-2 border-foreground paper-btn font-semibold"
            style={{ backgroundColor: "var(--sage)", color: "#1f3b1c" }}
          >
            <Link href="/recipes">🍽️ Explore Recipes</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-foreground paper-btn font-semibold"
            style={{ backgroundColor: "var(--blush-light)", color: "#5c2d3a" }}
          >
            <Link href="/community">💌 Community</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
