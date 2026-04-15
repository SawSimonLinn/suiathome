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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import type { SocialLink } from '@/lib/supabase/auth';

const PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram', placeholder: 'yourhandle' },
  { value: 'twitter', label: 'X / Twitter', placeholder: 'yourhandle' },
  { value: 'youtube', label: 'YouTube', placeholder: 'yourchannel' },
  { value: 'tiktok', label: 'TikTok', placeholder: 'yourhandle' },
  { value: 'facebook', label: 'Facebook', placeholder: 'yourpage' },
  { value: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' },
  { value: 'custom', label: 'Custom link', placeholder: 'https://...' },
] as const;

// Platforms where users enter a username instead of a full URL
const USERNAME_PLATFORMS: Record<string, { prefix: string; build: (u: string) => string }> = {
  instagram: { prefix: 'instagram.com/', build: (u) => `https://instagram.com/${u}` },
  twitter:   { prefix: 'x.com/', build: (u) => `https://x.com/${u}` },
  youtube:   { prefix: 'youtube.com/@', build: (u) => `https://youtube.com/@${u}` },
  tiktok:    { prefix: 'tiktok.com/@', build: (u) => `https://tiktok.com/@${u}` },
  facebook:  { prefix: 'facebook.com/', build: (u) => `https://facebook.com/${u}` },
};

function extractUsername(platform: string, url: string): string {
  const meta = USERNAME_PLATFORMS[platform];
  if (!meta || !url) return url;
  // Strip protocol + base
  const stripped = url.replace(/^https?:\/\//, '');
  const base = meta.prefix;
  if (stripped.startsWith(base)) return stripped.slice(base.length);
  // If stored as bare username already
  return url;
}

type SettingsFormProps = {
  userId: string;
  email: string;
  role: string;
  initialName: string;
  initialAvatarUrl: string;
  initialBio: string;
  initialSocialLinks: SocialLink[];
};

function getInitials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function getPlatformPlaceholder(platform: string) {
  return PLATFORM_OPTIONS.find((o) => o.value === platform)?.placeholder ?? 'https://...';
}

export function SettingsForm({
  userId,
  email,
  role,
  initialName,
  initialAvatarUrl,
  initialBio,
  initialSocialLinks,
}: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarPreview, setAvatarPreview] = useState(initialAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    initialSocialLinks.length > 0 ? initialSocialLinks : []
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const addSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform: 'instagram', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    setSocialLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  const previewName = name.trim() || email.split('@')[0] || 'Cook';

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Please add a display name before saving.');
      return;
    }

    // Build full URLs for username-based platforms; auto-prepend https:// for others
    const normalizedLinks = socialLinks.map((link) => {
      if (!link.url.trim()) return link;
      const meta = USERNAME_PLATFORMS[link.platform];
      if (meta) {
        const username = link.url.trim().replace(/^@/, '');
        return { ...link, url: meta.build(username) };
      }
      if (!link.url.match(/^https?:\/\//)) {
        return { ...link, url: `https://${link.url}` };
      }
      return link;
    });
    setSocialLinks(normalizedLinks);

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      let uploadedUrl = avatarUrl;

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${userId}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true });

        if (uploadError) {
          setErrorMessage(uploadError.message);
          return;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        uploadedUrl = data.publicUrl;
        setAvatarUrl(uploadedUrl);
      }

      // Filter out empty links
      const cleanedLinks = normalizedLinks.filter((l) => l.url.trim());

      const { error } = await supabase.from('profiles').upsert(
        {
          id: userId,
          name: name.trim(),
          avatar_url: uploadedUrl || null,
          bio: bio.trim() || null,
          social_links: cleanedLinks,
          last_active_at: new Date().toISOString(),
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
    <div className="grid gap-8 md:grid-cols-[2fr_1fr] lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
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

          <div className="flex flex-col items-center gap-4 border-2 border-foreground bg-secondary p-6 text-center paper-shadow-sm">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview} alt={previewName} />
              <AvatarFallback className="text-3xl">
                {getInitials(previewName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{previewName}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <form className="grid gap-6" onSubmit={handleSave}>
            {/* Display name */}
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

            {/* Bio */}
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community a little about yourself..."
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/300
              </p>
            </div>

            {/* Profile photo */}
            <div className="grid gap-2">
              <Label htmlFor="avatar-upload">Profile Photo</Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG, or WebP — uploaded to your account.
              </p>
            </div>

            {/* Social & custom links */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>Links</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSocialLink}
                  disabled={socialLinks.length >= 8}
                >
                  + Add link
                </Button>
              </div>

              {socialLinks.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add social media or custom links to show on your profile.
                </p>
              )}

              <div className="grid gap-3">
                {socialLinks.map((link, index) => (
                  <div
                    key={index}
                    className="grid gap-2 border-2 border-foreground bg-secondary/30 p-3 paper-shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <select
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        className="flex-1 rounded-none border-2 border-foreground bg-background px-3 py-1.5 text-sm"
                      >
                        {PLATFORM_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors text-lg leading-none px-1"
                        aria-label="Remove link"
                      >
                        ×
                      </button>
                    </div>

                    {link.platform === 'custom' && (
                      <Input
                        value={link.label ?? ''}
                        onChange={(e) => updateSocialLink(index, 'label', e.target.value)}
                        placeholder="Link label (e.g. My Linktree)"
                      />
                    )}

                    {(() => {
                      const usernameMeta = USERNAME_PLATFORMS[link.platform];
                      if (usernameMeta) {
                        const username = extractUsername(link.platform, link.url);
                        return (
                          <div className="flex items-center border-2 border-foreground bg-background overflow-hidden">
                            <span className="shrink-0 bg-secondary px-3 py-2 text-sm text-muted-foreground border-r-2 border-foreground">
                              {usernameMeta.prefix}
                            </span>
                            <input
                              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                              value={username}
                              onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                              placeholder={getPlatformPlaceholder(link.platform)}
                            />
                          </div>
                        );
                      }
                      return (
                        <Input
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                          placeholder={getPlatformPlaceholder(link.platform)}
                          type="text"
                        />
                      );
                    })()}
                  </div>
                ))}
              </div>
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
            <div className="border-2 border-foreground bg-background p-4 paper-shadow-sm">
              <p className="text-muted-foreground">Email</p>
              <p className="mt-1 font-medium">{email}</p>
            </div>
            <div className="border-2 border-foreground bg-background p-4 paper-shadow-sm">
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
