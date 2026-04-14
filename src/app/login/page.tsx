import { redirect } from 'next/navigation';

import { hasSupabaseEnv } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

import { LoginForm } from './login-form';

export default async function LoginPage() {
  const supabaseReady = hasSupabaseEnv();

  if (supabaseReady) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect('/profile');
    }
  }

  return <LoginForm supabaseReady={supabaseReady} />;
}
