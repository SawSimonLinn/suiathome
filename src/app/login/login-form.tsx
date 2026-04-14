'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

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
      setErrorMessage(
        'Add your Supabase URL and publishable key to .env.local first.'
      );
      return;
    }

    setIsSigningIn(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.replace(next);
      router.refresh();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabaseReady) {
      setErrorMessage(
        'Add your Supabase URL and publishable key to .env.local first.'
      );
      return;
    }

    setIsStartingGoogle(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Login</CardTitle>
          <CardDescription>
            Sign in with your email and password, or continue with Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!supabaseReady ? (
            <Alert variant="destructive">
              <AlertTitle>Supabase keys are missing</AlertTitle>
              <AlertDescription>
                Add `NEXT_PUBLIC_SUPABASE_URL` and
                `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`.
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isBusy}>
              {isSigningIn ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="relative py-1 text-center text-sm text-muted-foreground">
            <span className="bg-card px-2">or</span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isBusy}
          >
            {isStartingGoogle ? 'Redirecting...' : 'Continue with Google'}
          </Button>
        </CardContent>
        <div className="mb-6 mt-2 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="underline font-medium text-primary-foreground hover:text-primary"
          >
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}
