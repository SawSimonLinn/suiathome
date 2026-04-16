'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { useNavigationFeedback } from '@/components/layout/navigation-feedback-provider';
import { createClient } from '@/lib/supabase/client';

type SignOutButtonProps = Omit<ButtonProps, 'onClick'> & {
  onSignedOut?: () => void;
};

export function SignOutButton({
  children,
  disabled,
  onSignedOut,
  ...buttonProps
}: SignOutButtonProps) {
  const router = useRouter();
  const { startNavigation } = useNavigationFeedback();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      onSignedOut?.();
      startNavigation();
      router.push('/');
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      disabled={disabled || isSigningOut}
      {...buttonProps}
    >
      {isSigningOut ? 'Signing out...' : children ?? 'Sign Out'}
    </Button>
  );
}
