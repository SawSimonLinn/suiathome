import { Logo } from "@/components/icons/logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row md:px-8">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-primary" />
          <p className="text-center font-headline text-xl font-bold md:text-left">
            Sui at home
          </p>
        </div>
        <nav className="flex gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
          <Link href="/recipes" className="text-sm text-muted-foreground hover:text-foreground">Recipes</Link>
          <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground">Profile</Link>
        </nav>
        <p className="text-center text-sm text-muted-foreground md:text-right">
          © {new Date().getFullYear()} Sui at home. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
