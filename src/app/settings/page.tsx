import { redirect } from 'next/navigation';

import { SettingsForm } from './settings-form';
import { hasSupabaseEnv } from '@/lib/supabase/config';
import { getAuthContext } from '@/lib/supabase/auth';

export default async function SettingsPage() {
  if (!hasSupabaseEnv()) {
    redirect('/login?error=Add%20your%20Supabase%20env%20vars%20first.');
  }

  const authContext = await getAuthContext();

  if (!authContext.isLoggedIn || !authContext.userId || !authContext.userEmail) {
    redirect('/login?next=/settings');
  }

  const displayName =
    authContext.profile?.name?.trim() ||
    authContext.userEmail.split('@')[0] ||
    'Cook';

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <header className="mb-8 space-y-2 text-center md:mb-12">
        <h1 className="font-headline text-4xl md:text-5xl">Settings</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Manage your account details, security, and how your profile appears
          around the app.
        </p>
      </header>

      <SettingsForm
        userId={authContext.userId}
        email={authContext.userEmail}
        role={authContext.profile?.role || 'user'}
        initialName={displayName}
        initialAvatarUrl={authContext.profile?.avatar_url || ''}
      />
    </div>
  );
}
