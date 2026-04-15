'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/password-input';
import { createClient } from '@/lib/supabase/client';

type ResetPasswordFormProps = {
  supabaseReady: boolean;
  canReset: boolean;
  userEmail: string | null;
};

export function ResetPasswordForm({
  supabaseReady,
  canReset,
  userEmail,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabaseReady) {
      setErrorMessage(
        'Add your Supabase URL and publishable key to .env.local or .env first.'
      );
      return;
    }

    if (!canReset) {
      setErrorMessage('Open the password reset link from your email first.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Use a password with at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      await supabase.auth.signOut();
      setSuccessMessage('Password updated. Redirecting you to sign in...');
      router.replace('/login?message=Password%20updated.%20Please%20sign%20in%20again.');
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">
            Reset Password
          </CardTitle>
          <CardDescription>
            {userEmail
              ? `Set a new password for ${userEmail}.`
              : 'Use the link from your email to open this page with a valid recovery session.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!supabaseReady ? (
            <Alert variant="destructive">
              <AlertTitle>Supabase keys are missing</AlertTitle>
              <AlertDescription>
                Add `NEXT_PUBLIC_SUPABASE_URL` and a real public Supabase key to
                `.env.local` or `.env`.
              </AlertDescription>
            </Alert>
          ) : null}

          {!canReset ? (
            <Alert variant="destructive">
              <AlertTitle>Recovery session missing</AlertTitle>
              <AlertDescription>
                Request a fresh password reset email, then open the latest link
                from your inbox.
              </AlertDescription>
            </Alert>
          ) : null}

          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Couldn&apos;t update password</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {successMessage ? (
            <Alert>
              <AlertTitle>Password updated</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          ) : null}

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="password">New password</Label>
              <PasswordInput
                id="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <PasswordInput
                id="confirmPassword"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isSubmitting || !canReset}
            >
              {isSubmitting ? 'Updating password...' : 'Update password'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-foreground underline hover:text-muted-foreground"
            >
              Need a new reset email?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
