import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t-2 border-foreground bg-secondary">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row md:px-8">
        <div className="flex items-center gap-2">
          <p className="text-center font-headline text-xl font-bold md:text-left">
            Sui at home
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <nav className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground hover:underline">Home</Link>
            <Link href="/recipes" className="text-sm text-muted-foreground hover:text-foreground hover:underline">Recipes</Link>
            <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground hover:underline">Profile</Link>
          </nav>
          <nav className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground hover:underline">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="text-sm text-muted-foreground hover:text-foreground hover:underline">Terms &amp; Conditions</Link>
          </nav>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-right">
          © {new Date().getFullYear()} Sui at home. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
