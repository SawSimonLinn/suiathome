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

type SignupFormProps = {
  supabaseReady: boolean;
};

function getNextPath(next: string | null) {
  if (!next || !next.startsWith('/')) {
    return '/profile';
  }

  return next;
}

export function SignupForm({ supabaseReady }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);

  const next = getNextPath(searchParams.get('next'));

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabaseReady) {
      setErrorMessage(
        'Add your Supabase URL and publishable key to .env.local first.'
      );
      return;
    }

    setIsSigningUp(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace(next);
        router.refresh();
        return;
      }

      router.replace(
        '/login?message=Check%20your%20email%20to%20confirm%20your%20account.'
      );
      router.refresh();
    } finally {
      setIsSigningUp(false);
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

  const isBusy = isSigningUp || isStartingGoogle;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Sign Up</CardTitle>
          <CardDescription>
            Create an account with email and password, or continue with Google.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {!supabaseReady ? (
              <Alert variant="destructive">
                <AlertTitle>Supabase keys are missing</AlertTitle>
                <AlertDescription>
                  Add `NEXT_PUBLIC_SUPABASE_URL` and
                  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`.
                </AlertDescription>
              </Alert>
            ) : null}

            {errorMessage ? (
              <Alert variant="destructive">
                <AlertTitle>Signup failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <form className="grid gap-4" onSubmit={handleSignup}>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Sui"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
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
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isBusy}>
                {isSigningUp ? 'Creating account...' : 'Create an account'}
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
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link
              href="/login"
              className="underline font-medium text-primary-foreground hover:text-primary"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
