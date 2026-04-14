import { hasSupabaseEnv } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

import { ResetPasswordForm } from './reset-password-form';

export default async function ResetPasswordPage() {
  const supabaseReady = hasSupabaseEnv();
  let userEmail: string | null = null;

  if (supabaseReady) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    userEmail = user?.email ?? null;
  }

  return (
    <ResetPasswordForm
      supabaseReady={supabaseReady}
      canReset={Boolean(userEmail)}
      userEmail={userEmail}
    />
  );
}
