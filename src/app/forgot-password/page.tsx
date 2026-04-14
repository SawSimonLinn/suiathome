import { hasSupabaseEnv } from '@/lib/supabase/config';

import { ForgotPasswordForm } from './reset-request-form';

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm supabaseReady={hasSupabaseEnv()} />;
}
