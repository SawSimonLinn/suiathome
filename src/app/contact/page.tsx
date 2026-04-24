import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Music2,
  type LucideIcon,
} from 'lucide-react';

import {
  COLLAB_EMAIL,
  CONTACT_EMAIL,
  SITE_DOMAIN,
  SITE_SOCIAL_LINKS,
  SITE_URL,
  type SiteSocialPlatform,
} from '@/lib/site';

const SOCIAL_ICONS: Record<SiteSocialPlatform, LucideIcon> = {
  instagram: Instagram,
  tiktok: Music2,
  facebook: Facebook,
  linkedin: Linkedin,
};

export const metadata: Metadata = {
  title: 'Contact | Sui at home',
  description:
    'Contact Sui at home for general questions, collaborations, and social media.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="relative overflow-hidden border-2 border-foreground bg-paper paper-shadow">
        <div
          className="flex w-full items-center justify-center gap-2 border-b-2 border-foreground px-4 py-2"
          style={{ backgroundColor: 'var(--sage)' }}
        >
          <span
            className="text-sm font-medium uppercase tracking-widest"
            style={{ color: '#2d4a2a' }}
          >
            🌿 &nbsp; Contact Sui at home &nbsp; 🌿
          </span>
        </div>

        <div className="absolute left-5 top-[2.6rem] h-4 w-14 rotate-[-2deg] border border-foreground/60" style={{ backgroundColor: 'var(--brass)', opacity: 0.6 }} aria-hidden="true" />
        <div className="absolute right-7 top-[2.6rem] h-4 w-12 rotate-[1.5deg] border border-foreground/60" style={{ backgroundColor: 'var(--blush)' }} aria-hidden="true" />

        <div className="p-6 md:p-10">
          <div className="mb-5 flex justify-center gap-2" aria-hidden="true">
            {['🌸', '🌼', '🌸', '🌼', '🌸'].map((flower, index) => (
              <span key={`${flower}-${index}`} className="text-xl">
                {flower}
              </span>
            ))}
          </div>

          <div className="mb-8 text-center">
            <h1 className="font-headline text-3xl md:text-4xl" style={{ color: '#2d4a2a' }}>
              Let&apos;s Connect
            </h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Reach us at <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline underline-offset-2">{SITE_DOMAIN}</a>.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-start gap-3 border-2 border-foreground bg-background p-4 paper-shadow-sm transition-colors hover:bg-secondary"
            >
              <Mail className="mt-1 h-5 w-5 shrink-0" />
              <span>
                <span className="block text-sm font-semibold uppercase tracking-wide text-muted-foreground">General Contact</span>
                <span className="block text-base font-medium">{CONTACT_EMAIL}</span>
              </span>
            </a>
            <a
              href={`mailto:${COLLAB_EMAIL}`}
              className="flex items-start gap-3 border-2 border-foreground bg-background p-4 paper-shadow-sm transition-colors hover:bg-secondary"
            >
              <Mail className="mt-1 h-5 w-5 shrink-0" />
              <span>
                <span className="block text-sm font-semibold uppercase tracking-wide text-muted-foreground">Collaborations</span>
                <span className="block text-base font-medium">{COLLAB_EMAIL}</span>
              </span>
            </a>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 border-b-2 border-dashed border-foreground/30 pb-2 font-headline text-2xl">Social Links</h2>
            <div className="flex flex-wrap gap-2">
              {SITE_SOCIAL_LINKS.map((socialLink) => {
                const Icon = SOCIAL_ICONS[socialLink.platform];

                return (
                  <a
                    key={socialLink.href}
                    href={socialLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-sm font-medium paper-shadow-sm transition-colors hover:bg-secondary"
                    aria-label={`${socialLink.label} (opens in a new tab)`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{socialLink.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>
                );
              })}
            </div>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Also review our{' '}
            <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms-and-conditions" className="underline underline-offset-2 hover:text-foreground">
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </div>

        <div
          className="flex w-full justify-center gap-3 border-t-2 border-foreground py-2 text-lg"
          style={{ backgroundColor: 'var(--blush-light)' }}
          aria-hidden="true"
        >
          <span>🌷</span>
          <span>🌿</span>
          <span>🫶</span>
          <span>🌿</span>
          <span>🌷</span>
        </div>
      </div>
    </div>
  );
}
