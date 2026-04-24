'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ChevronDown,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  LogOut,
  Mail,
  Music2,
  Settings,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useNavigationFeedback } from '@/components/layout/navigation-feedback-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SITE_SOCIAL_LINKS, type SiteSocialPlatform } from '@/lib/site';
import { createClient } from '@/lib/supabase/client';

type AccountMenuProps = {
  userEmail: string;
  isAdmin: boolean;
};

const SOCIAL_ICONS: Record<SiteSocialPlatform, LucideIcon> = {
  instagram: Instagram,
  tiktok: Music2,
  facebook: Facebook,
  linkedin: Linkedin,
};

export function AccountMenu({ userEmail, isAdmin }: AccountMenuProps) {
  const router = useRouter();
  const { startNavigation } = useNavigationFeedback();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      startNavigation();
      router.push('/');
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          Profile
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-1">
          <div className="font-medium">Signed in</div>
          <div className="text-xs font-normal text-muted-foreground">
            {userEmail}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/contact">
            <Mail />
            Contact
          </Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Shield />
              Admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Follow
        </DropdownMenuLabel>
        {SITE_SOCIAL_LINKS.map((socialLink) => {
          const Icon = SOCIAL_ICONS[socialLink.platform];

          return (
            <DropdownMenuItem key={socialLink.href} asChild>
              <a href={socialLink.href} target="_blank" rel="noopener noreferrer">
                <Icon />
                {socialLink.label}
                <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-70" />
              </a>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void handleSignOut();
          }}
          disabled={isSigningOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut />
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
