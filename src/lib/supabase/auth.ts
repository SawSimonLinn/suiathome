import { createClient } from '@/lib/supabase/server';

export type AppRole = 'user' | 'admin';

export type SocialLink = {
  platform: string; // 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'facebook' | 'website' | 'custom'
  url: string;
  label?: string; // used for 'custom' platform
};

export type ProfileRecord = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  role: AppRole | null;
  created_at?: string;
  bio?: string | null;
  social_links?: SocialLink[] | null;
  last_active_at?: string | null;
};

export type AuthContext = {
  userId: string | null;
  userEmail: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  profile: ProfileRecord | null;
};

export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      userEmail: null,
      isLoggedIn: false,
      isAdmin: false,
      profile: null,
    };
  }

  // Try extended query; fall back to base columns if migration hasn't run yet
  let profile: ProfileRecord | null = null;
  const { data: fullProfile, error: fullError } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, role, created_at, bio, social_links, last_active_at')
    .eq('id', user.id)
    .maybeSingle<ProfileRecord>();

  if (!fullError) {
    profile = fullProfile;
  } else {
    const { data: baseProfile } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, role, created_at')
      .eq('id', user.id)
      .maybeSingle<ProfileRecord>();
    profile = baseProfile ?? null;
  }

  return {
    userId: user.id,
    userEmail: user.email ?? null,
    isLoggedIn: true,
    isAdmin: profile?.role === 'admin',
    profile: profile ?? null,
  };
}
