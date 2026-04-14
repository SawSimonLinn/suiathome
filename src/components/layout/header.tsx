"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, CircleUserRound } from "lucide-react";
import { Logo } from "@/components/icons/logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recipes" },
];

export function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Placeholder for auth state
  const isLoggedIn = false;

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold sm:inline-block font-headline text-2xl">
              Sui at home
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-lg font-bold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu Trigger */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 w-4/5 border-r-2 border-border">
            <Link
              href="/"
              className="mb-6 flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Logo className="mr-2 h-6 w-6" />
              <span className="font-bold font-headline text-xl">Sui at home</span>
            </Link>
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                   className={cn(
                    "transition-colors hover:text-primary text-lg font-bold",
                    pathname === link.href ? "text-primary" : "text-foreground/80"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Mobile-only Centered Logo */}
        <div className="flex-1 flex justify-center md:hidden">
            <Link href="/" className="flex items-center space-x-2">
                <Logo className="h-8 w-8 text-primary" />
                <span className="font-bold sm:inline-block font-headline text-2xl">
                    Sui at home
                </span>
            </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-1">
          {isLoggedIn ? (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <CircleUserRound className="h-6 w-6" />
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
