import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Linkedin,
  Music2,
  type LucideIcon,
} from 'lucide-react';

import {
  SITE_DOMAIN,
  SITE_SOCIAL_LINKS,
  SITE_URL,
  type SiteSocialPlatform,
} from '@/lib/site';

const footerMainLinks = [
  { href: '/', label: 'Home' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/profile', label: 'Profile' },
];

const footerLegalLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
];

const SOCIAL_ICONS: Record<SiteSocialPlatform, LucideIcon> = {
  instagram: Instagram,
  tiktok: Music2,
  facebook: Facebook,
  linkedin: Linkedin,
};

export function Footer() {
  return (
    <footer className="mt-12 border-t-2 border-foreground" style={{ backgroundColor: 'var(--sage-light)' }}>
      {/* Floral top strip */}
      <div className="flex justify-center gap-3 text-lg py-2 border-b-2 border-foreground" style={{ backgroundColor: 'var(--blush-light)' }} aria-hidden="true">
        <span>🌸</span><span>🌿</span><span>🌷</span><span>🫶</span><span>🌷</span><span>🌿</span><span>🌸</span>
      </div>

      <div className="container mx-auto px-4 py-8 md:px-8 md:py-10">
        <div className="grid gap-8 border-2 border-foreground bg-paper p-6 paper-shadow md:grid-cols-[1.2fr_1fr_1fr] md:gap-6">
          <div className="space-y-3">
            <p className="font-headline text-2xl font-bold leading-none">🌿 Sui at home</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Home-style Burmese cooking, community recipes, and stories from the kitchen.
            </p>
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex border-2 border-foreground bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide paper-shadow-sm transition-colors hover:bg-secondary"
            >
              {SITE_DOMAIN}
            </a>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Explore</p>
            <nav className="flex flex-col gap-2">
              {footerMainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Follow</p>
            <nav className="flex flex-wrap gap-2" aria-label="Social links">
              {SITE_SOCIAL_LINKS.map((socialLink) => {
                const Icon = SOCIAL_ICONS[socialLink.platform];

                return (
                  <a
                    key={socialLink.href}
                    href={socialLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-1 text-sm font-medium paper-shadow-sm transition-colors hover:bg-secondary"
                    aria-label={`${socialLink.label} (opens in a new tab)`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{socialLink.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t-2 border-foreground pt-4 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap gap-4">
            {footerLegalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground md:text-right">
            © {new Date().getFullYear()}{' '}
            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">
              {SITE_DOMAIN}
            </a>
            . All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
