'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const adminLinks = [
  {
    href: '/admin',
    label: 'Dashboard',
    isActive: (pathname: string) => pathname === '/admin',
  },
  {
    href: '/admin/recipes/new',
    label: 'Upload Recipe',
    isActive: (pathname: string) => pathname === '/admin/recipes/new',
  },
  {
    href: '/admin/recipes',
    label: 'Edit Uploaded Recipes',
    isActive: (pathname: string) =>
      pathname === '/admin/recipes' || pathname.startsWith('/admin/recipes/'),
  },
  {
    href: '/admin/comments',
    label: 'Moderate Comments',
    isActive: (pathname: string) => pathname.startsWith('/admin/comments'),
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-3 overflow-x-auto pb-1"
      aria-label="Admin navigation"
    >
      {adminLinks.map((link) => {
        const isActive = link.isActive(pathname);

        return (
          <Button
            key={link.href}
            asChild
            variant={isActive ? 'default' : 'outline'}
            className={cn(
              'shrink-0 whitespace-nowrap',
              isActive ? '' : 'bg-background'
            )}
          >
            <Link href={link.href}>{link.label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
