import { Logo } from "@/components/icons/logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-8">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <p className="text-center font-headline text-lg font-semibold md:text-left">
            Sui at home
          </p>
        </div>
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with love for home cooks everywhere.
        </p>
        <p className="text-center text-sm text-muted-foreground md:text-right">
          © {new Date().getFullYear()} Sui at home. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
