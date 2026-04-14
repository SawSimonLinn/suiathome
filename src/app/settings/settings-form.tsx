'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { SignOutButton } from '@/components/layout/sign-out-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

type SettingsFormProps = {
  userId: string;
  email: string;
  role: string;
  initialName: string;
  initialAvatarUrl: string;
};

function getInitials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

export function SettingsForm({
  userId,
  email,
  role,
  initialName,
  initialAvatarUrl,
}: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const previewName = name.trim() || email.split('@')[0] || 'Cook';

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Please add a display name before saving.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from('profiles').upsert(
        {
          id: userId,
          name: name.trim(),
          avatar_url: avatarUrl.trim() || null,
        },
        { onConflict: 'id' }
      );

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      toast({
        title: 'Settings saved',
        description: 'Your profile details were updated successfully.',
      });
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsSendingReset(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      toast({
        title: 'Password reset sent',
        description: `Check ${email} for the reset link.`,
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Profile Settings</CardTitle>
          <CardDescription>
            Update how your account appears across recipes, comments, and the
            community feed.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Could not update settings</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col items-center gap-4 rounded-lg border bg-secondary/40 p-6 text-center">
            <Avatar className="h-24 w-24 border-4 border-primary/15">
              <AvatarImage src={avatarUrl} alt={previewName} />
              <AvatarFallback className="text-3xl">
                {getInitials(previewName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{previewName}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <form className="grid gap-5" onSubmit={handleSave}>
            <div className="grid gap-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatar-url">Avatar Image URL</Label>
              <Input
                id="avatar-url"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Paste a public image URL if you want a custom profile photo.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/profile">Back to Profile</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Account</CardTitle>
            <CardDescription>
              Your sign-in details and account role.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground">Email</p>
              <p className="mt-1 font-medium">{email}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground">Role</p>
              <p className="mt-1 font-medium capitalize">{role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Security</CardTitle>
            <CardDescription>
              Send yourself a password reset link anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePasswordReset}
              disabled={isSendingReset}
            >
              {isSendingReset ? 'Sending...' : 'Send Password Reset Email'}
            </Button>
            <p className="text-sm text-muted-foreground">
              This sends a reset link to your current account email.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Session</CardTitle>
            <CardDescription>
              Sign out of your current browser session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
