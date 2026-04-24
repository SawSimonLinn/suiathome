"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Facebook,
  Instagram,
  Linkedin,
  Menu,
  Music2,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { AccountMenu } from "@/components/layout/account-menu";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SITE_SOCIAL_LINKS, type SiteSocialPlatform } from "@/lib/site";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/recipes", label: "Recipes", emoji: "🍜" },
  { href: "/community", label: "Community", emoji: "💬" },
  { href: "/about", label: "About", emoji: "🌸" },
];

const drawerUtilityLinks = [{ href: "/contact", label: "Contact", emoji: "✉️" }];

const SOCIAL_ICONS: Record<SiteSocialPlatform, LucideIcon> = {
  instagram: Instagram,
  tiktok: Music2,
  facebook: Facebook,
  linkedin: Linkedin,
};

type HeaderProps = {
  userEmail: string | null;
  isAdmin: boolean;
};

export function Header({ userEmail, isAdmin }: HeaderProps) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLoggedIn = Boolean(userEmail);
  const accountLinks = [
    ...(isLoggedIn ? [{ href: "/profile", label: "Profile", emoji: "👤" }] : []),
    ...(isLoggedIn ? [{ href: "/settings", label: "Settings", emoji: "⚙️" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin", emoji: "🛠️" }] : []),
  ];

  const isActiveLink = (href: string) =>
    href === "/"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const mobileLinkClassName = (href: string) =>
    cn(
      "flex items-center justify-between border-2 border-foreground px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors",
      isActiveLink(href)
        ? "bg-primary text-primary-foreground paper-btn-dark"
        : "bg-background text-foreground paper-btn"
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-foreground" style={{ backgroundColor: 'var(--sage)' }}>
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4 md:h-20 md:px-8">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          <Link href="/" className="flex items-center">
            <span className="font-headline text-xl font-bold leading-none md:text-3xl">
              Sui at home
            </span>
          </Link>
          <nav className="hidden items-center space-x-8 text-base md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-foreground",
                  isActiveLink(link.href)
                    ? "font-bold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <AccountMenu userEmail={userEmail!} isAdmin={isAdmin} />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">🔑 Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">✨ Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(88vw,24rem)] overflow-y-auto border-l-2 border-foreground px-5 pt-4"
            >
              <SheetHeader className="pr-14 text-left">
                <SheetTitle className="font-headline text-2xl leading-none">
                  Sui at home
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-6">
                <nav className="flex flex-col gap-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={mobileLinkClassName(link.href)}
                    >
                      <span>{link.emoji} {link.label}</span>
                    </Link>
                  ))}
                </nav>

                <nav className="flex flex-col gap-3">
                  {drawerUtilityLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={mobileLinkClassName(link.href)}
                    >
                      <span>{link.emoji} {link.label}</span>
                    </Link>
                  ))}
                </nav>

                <div className="border-t-2 border-foreground pt-6">
                  {isLoggedIn ? (
                    <>
                      <div className="mb-4 space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Signed in
                        </p>
                        <p className="break-words text-sm font-medium">
                          {userEmail}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3">
                        {accountLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={mobileLinkClassName(link.href)}
                          >
                            <span>{link.emoji} {link.label}</span>
                          </Link>
                        ))}
                        <SignOutButton
                          className="w-full"
                          onSignedOut={() => setMobileMenuOpen(false)}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Button
                        asChild
                        className="w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/signup">✨ Sign Up</Link>
                      </Button>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/login">🔑 Log In</Link>
                      </Button>
                    </div>
                  )}
                </div>

                <nav className="mt-2 flex items-center justify-center gap-2 border-t-2 border-foreground pt-4" aria-label="Social links">
                  {SITE_SOCIAL_LINKS.map((socialLink) => {
                    const Icon = SOCIAL_ICONS[socialLink.platform];

                    return (
                      <a
                        key={socialLink.href}
                        href={socialLink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background transition-colors hover:bg-secondary"
                        aria-label={`${socialLink.label} (opens in a new tab)`}
                        title={socialLink.label}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
