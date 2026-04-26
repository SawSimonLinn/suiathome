'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/password-input';
import { AdSlot } from '@/components/ad-slot';
import { useNavigationFeedback } from '@/components/layout/navigation-feedback-provider';
import { createLegalConsentMetadata } from '@/lib/legal';
import { createClient } from '@/lib/supabase/client';
import {
  GOOGLE_AUTH_REDIRECT_URL,
  OAUTH_LEGAL_CONSENT_COOKIE,
  OAUTH_NEXT_COOKIE,
  serializeOAuthStateCookie,
} from '@/lib/supabase/oauth';

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
  const { startNavigation } = useNavigationFeedback();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);

  const next = getNextPath(searchParams.get('next'));
  const hasAcceptedLegalDocuments = hasAcceptedLegal;

  useEffect(() => {
    if (hasAcceptedLegalDocuments && errorMessage === LEGAL_ACCEPTANCE_ERROR) {
      setErrorMessage(null);
    }
  }, [errorMessage, hasAcceptedLegalDocuments]);

  const validateLegalAcceptance = () => {
    if (hasAcceptedLegalDocuments) return true;
    setErrorMessage(LEGAL_ACCEPTANCE_ERROR);
    return false;
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabaseReady) {
      setErrorMessage('Add your Supabase URL and publishable key to .env.local or .env first.');
      return;
    }

    if (!validateLegalAcceptance()) return;

    setIsSigningUp(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, ...createLegalConsentMetadata() },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        startNavigation();
        router.replace(next);
        router.refresh();
        return;
      }

      startNavigation();
      router.replace('/login?message=Check%20your%20email%20to%20confirm%20your%20account.');
      router.refresh();
    } finally {
      setIsSigningUp(false);
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
      document.cookie = serializeOAuthStateCookie(
        OAUTH_LEGAL_CONSENT_COOKIE,
        'true'
      );

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: GOOGLE_AUTH_REDIRECT_URL() },
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Top ad — leaderboard desktop, banner mobile */}
      <div className="w-full flex justify-center py-2 px-4">
        <AdSlot variant="leaderboard" />
      </div>

      <div className="flex flex-1 items-center justify-center">
        {/* Left skyscraper — xl+ only */}
        <aside className="hidden xl:flex shrink-0 w-[160px] items-center justify-center px-2" aria-hidden="true">
          <AdSlot variant="skyscraper" />
        </aside>

        <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md border-2 border-foreground bg-paper paper-shadow relative overflow-hidden">

        {/* Sage green top ribbon */}
        <div className="w-full border-b-2 border-foreground py-2 px-4 flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--sage)' }}>
          <span className="text-sm font-medium tracking-widest uppercase" style={{ color: '#2d4a2a' }}>
            🌿 &nbsp; Join the kitchen &nbsp; 🌿
          </span>
        </div>

        {/* Tape strips */}
        <div className="absolute top-[2.6rem] left-5 w-12 h-4 border border-foreground/60 rotate-[-3deg]" style={{ backgroundColor: 'var(--blush)', opacity: 0.7 }} aria-hidden="true" />
        <div className="absolute top-[2.6rem] right-6 w-10 h-4 border border-foreground/60 rotate-[2deg]" style={{ backgroundColor: 'var(--lavender)', opacity: 0.8 }} aria-hidden="true" />

        <div className="p-6 grid gap-4">
          {/* Flower row */}
          <div className="flex justify-center gap-2 mt-2" aria-hidden="true">
            {['🌸', '🌼', '🌸', '🌼', '🌸'].map((f, i) => (
              <span key={i} className="text-lg">{f}</span>
            ))}
          </div>

          <div className="text-center">
            <h1 className="font-headline text-3xl" style={{ color: '#2d4a2a' }}>Sign Up</h1>
            {/* Squiggly underline */}
            <div className="flex justify-center mt-2">
              <svg width="100" height="10" viewBox="0 0 100 10" fill="none" aria-hidden="true">
                <path d="M2 6 Q12 2 22 6 Q32 10 42 6 Q52 2 62 6 Q72 10 82 6 Q90 3 98 6" stroke="var(--sage-dark)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Create an account with email and password, or continue with Google.
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
            <div className="flex items-start gap-3 rounded-none border-2 border-foreground bg-background p-4">
              <Checkbox
                id="legal"
                checked={hasAcceptedLegal}
                onCheckedChange={(checked) => setHasAcceptedLegal(checked === true)}
              />
              <Label htmlFor="legal" className="text-sm font-normal leading-6">
                I agree to the{' '}
                <Link href="/privacy-policy" className="font-medium text-foreground underline hover:text-muted-foreground" target="_blank" rel="noreferrer">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href="/terms-and-conditions" className="font-medium text-foreground underline hover:text-muted-foreground" target="_blank" rel="noreferrer">
                  Terms &amp; Conditions
                </Link>.
              </Label>
            </div>
            <Button type="submit" className="w-full mt-2 border-2 border-foreground paper-btn font-semibold" style={{ backgroundColor: 'var(--sage)', color: '#1f3b1c' }} disabled={isBusy}>
              {isSigningUp ? '🔄 Creating account...' : '🌸 Create an account'}
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
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-foreground underline hover:text-muted-foreground">
              Sign in
            </Link>
          </p>
        </div>

        {/* Bottom floral strip */}
        <div className="w-full border-t-2 border-foreground py-2 flex justify-center gap-3 text-lg" style={{ backgroundColor: 'var(--blush-light)' }} aria-hidden="true">
          <span>🌷</span><span>🌿</span><span>🫶</span><span>🌿</span><span>🌷</span>
        </div>
      </div>
        </div>

        {/* Right skyscraper — xl+ only */}
        <aside className="hidden xl:flex shrink-0 w-[160px] items-center justify-center px-2" aria-hidden="true">
          <AdSlot variant="skyscraper" />
        </aside>
      </div>

      {/* Bottom ad */}
      <div className="w-full flex justify-center py-2 px-4">
        <AdSlot variant="leaderboard" />
      </div>
    </div>
  );
}
