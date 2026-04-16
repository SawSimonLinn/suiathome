'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/password-input';
import { createClient } from '@/lib/supabase/client';
import { useNavigationFeedback } from '@/components/layout/navigation-feedback-provider';
import {
  GOOGLE_AUTH_REDIRECT_URL,
  OAUTH_NEXT_COOKIE,
  serializeOAuthStateCookie,
} from '@/lib/supabase/oauth';

type LoginFormProps = {
  supabaseReady: boolean;
};

function getNextPath(next: string | null) {
  if (!next || !next.startsWith('/')) {
    return '/profile';
  }
  return next;
}

export function LoginForm({ supabaseReady }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startNavigation } = useNavigationFeedback();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);

  const next = getNextPath(searchParams.get('next'));
  const urlMessage = searchParams.get('message');
  const urlError = searchParams.get('error');

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabaseReady) {
      setErrorMessage('Add your Supabase URL and publishable key to .env.local or .env first.');
      return;
    }

    setIsSigningIn(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      startNavigation();
      router.replace(next);
      router.refresh();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabaseReady) {
      setErrorMessage('Add your Supabase URL and publishable key to .env.local or .env first.');
      return;
    }

    setIsStartingGoogle(true);
    setErrorMessage(null);

    try {
      document.cookie = serializeOAuthStateCookie(OAUTH_NEXT_COOKIE, next);

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: GOOGLE_AUTH_REDIRECT_URL,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } finally {
      setIsStartingGoogle(false);
    }
  };

  const isBusy = isSigningIn || isStartingGoogle;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md border-2 border-foreground bg-paper paper-shadow relative overflow-hidden">

        {/* Sage green top ribbon */}
        <div className="w-full border-b-2 border-foreground py-2 px-4 flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--sage)' }}>
          <span className="text-sm font-medium tracking-widest uppercase" style={{ color: '#2d4a2a' }}>
            🌿 &nbsp; Welcome back &nbsp; 🌿
          </span>
        </div>

        {/* Tape strips */}
        <div className="absolute top-[2.6rem] left-5 w-12 h-4 border border-foreground/60 rotate-[-3deg]" style={{ backgroundColor: 'var(--brass)', opacity: 0.6 }} aria-hidden="true" />
        <div className="absolute top-[2.6rem] right-6 w-10 h-4 border border-foreground/60 rotate-[2deg]" style={{ backgroundColor: 'var(--blush)' }} aria-hidden="true" />

        <div className="p-6 grid gap-4">
          {/* Flower row */}
          <div className="flex justify-center gap-2 mt-2" aria-hidden="true">
            {['🌸', '🌼', '🌸', '🌼', '🌸'].map((f, i) => (
              <span key={i} className="text-lg">{f}</span>
            ))}
          </div>

          <div className="text-center">
            <h1 className="font-headline text-3xl" style={{ color: '#2d4a2a' }}>Login</h1>
            {/* Squiggly underline */}
            <div className="flex justify-center mt-2">
              <svg width="100" height="10" viewBox="0 0 100 10" fill="none" aria-hidden="true">
                <path d="M2 6 Q12 2 22 6 Q32 10 42 6 Q52 2 62 6 Q72 10 82 6 Q90 3 98 6" stroke="var(--sage-dark)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in with your email and password, or continue with Google.
            </p>
          </div>

          {!supabaseReady ? (
            <Alert variant="destructive">
              <AlertTitle>Supabase keys are missing</AlertTitle>
              <AlertDescription>
                Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local` or `.env`.
              </AlertDescription>
            </Alert>
          ) : null}

          {urlMessage ? (
            <Alert>
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>{urlMessage}</AlertDescription>
            </Alert>
          ) : null}

          {urlError || errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription>{urlError ?? errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <form className="grid gap-4" onSubmit={handleEmailSignIn}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-foreground underline hover:text-muted-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full mt-2 border-2 border-foreground paper-btn font-semibold" style={{ backgroundColor: 'var(--sage)', color: '#1f3b1c' }} disabled={isBusy}>
              {isSigningIn ? '🔄 Signing in...' : '🔑 Sign in'}
            </Button>
          </form>

          <div className="relative py-1 text-center text-sm text-muted-foreground">
            <span className="bg-paper px-2">or</span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-2 border-foreground paper-btn font-semibold"
            onClick={handleGoogleSignIn}
            disabled={isBusy}
          >
            {isStartingGoogle ? '🔄 Redirecting...' : '🌐 Continue with Google'}
          </Button>

          <p className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-foreground underline hover:text-muted-foreground">
              Sign up
            </Link>
          </p>
        </div>

        {/* Bottom floral strip */}
        <div className="w-full border-t-2 border-foreground py-2 flex justify-center gap-3 text-lg" style={{ backgroundColor: 'var(--blush-light)' }} aria-hidden="true">
          <span>🌷</span><span>🌿</span><span>🫶</span><span>🌿</span><span>🌷</span>
        </div>
      </div>
    </div>
  );
}
