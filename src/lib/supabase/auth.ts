import { createClient } from '@/lib/supabase/server';

export type AppRole = 'user' | 'admin';

export type ProfileRecord = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  role: AppRole | null;
  created_at?: string;
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, role, created_at')
    .eq('id', user.id)
    .maybeSingle<ProfileRecord>();

  return {
    userId: user.id,
    userEmail: user.email ?? null,
    isLoggedIn: true,
    isAdmin: profile?.role === 'admin',
    profile: profile ?? null,
  };
}
