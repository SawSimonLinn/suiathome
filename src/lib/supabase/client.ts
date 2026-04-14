import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from '@/lib/supabase/config';

export function createClient() {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
}
