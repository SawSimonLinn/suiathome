'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/password-input';
import { createLegalConsentMetadata } from '@/lib/legal';
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

const LEGAL_ACCEPTANCE_ERROR =
  'Please accept the Privacy Policy and Terms & Conditions to continue.';

export function SignupForm({ supabaseReady }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasAcceptedPrivacyPolicy, setHasAcceptedPrivacyPolicy] =
    useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);

  const next = getNextPath(searchParams.get('next'));
  const hasAcceptedLegalDocuments =
    hasAcceptedPrivacyPolicy && hasAcceptedTerms;

  useEffect(() => {
    if (hasAcceptedLegalDocuments && errorMessage === LEGAL_ACCEPTANCE_ERROR) {
      setErrorMessage(null);
    }
  }, [errorMessage, hasAcceptedLegalDocuments]);

  const validateLegalAcceptance = () => {
    if (hasAcceptedLegalDocuments) {
      return true;
    }

    setErrorMessage(LEGAL_ACCEPTANCE_ERROR);
    return false;
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabaseReady) {
      setErrorMessage(
        'Add your Supabase URL and publishable key to .env.local or .env first.'
      );
      return;
    }

    if (!validateLegalAcceptance()) {
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
            ...createLegalConsentMetadata(),
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
        'Add your Supabase URL and publishable key to .env.local or .env first.'
      );
      return;
    }

    if (!validateLegalAcceptance()) {
      return;
    }

    setIsStartingGoogle(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const redirectUrl = new URL('/auth/callback', window.location.origin);
      redirectUrl.searchParams.set('next', next);
      redirectUrl.searchParams.set('privacyAccepted', 'true');
      redirectUrl.searchParams.set('termsAccepted', 'true');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl.toString(),
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
                  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local` or
                  `.env`.
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
                <PasswordInput
                  id="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="grid gap-3 rounded-md border-2 border-foreground bg-background p-4">
                <p className="text-sm text-muted-foreground">
                  Accept both agreements to create your account.
                </p>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="privacy-policy"
                    checked={hasAcceptedPrivacyPolicy}
                    onCheckedChange={(checked) =>
                      setHasAcceptedPrivacyPolicy(checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="privacy-policy"
                      className="text-sm font-normal leading-6"
                    >
                      I agree to the Privacy Policy.
                    </Label>
                    <Link
                      href="/privacy-policy"
                      className="text-sm font-medium text-foreground underline hover:text-muted-foreground"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read Privacy Policy
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms-and-conditions"
                    checked={hasAcceptedTerms}
                    onCheckedChange={(checked) =>
                      setHasAcceptedTerms(checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="terms-and-conditions"
                      className="text-sm font-normal leading-6"
                    >
                      I agree to the Terms &amp; Conditions.
                    </Label>
                    <Link
                      href="/terms-and-conditions"
                      className="text-sm font-medium text-foreground underline hover:text-muted-foreground"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read Terms &amp; Conditions
                    </Link>
                  </div>
                </div>
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
              className="font-medium text-foreground underline hover:text-muted-foreground"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
