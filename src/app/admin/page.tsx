import { notFound, redirect } from 'next/navigation';
import { Users } from 'lucide-react';

import { AdminNav } from '@/components/layout/admin-nav';
import { Badge } from '@/components/ui/badge';
import { getAuthContext } from '@/lib/supabase/auth';
import { getAllUsers } from '@/lib/supabase/admin';
import { hasSupabaseEnv } from '@/lib/supabase/config';
import { UserManagementPanel } from './user-management-panel';

export default async function AdminPage() {
  if (!hasSupabaseEnv()) {
    redirect('/login?error=Add%20your%20Supabase%20env%20vars%20first.');
  }

  const authContext = await getAuthContext();

  if (!authContext.isLoggedIn) {
    redirect('/login?next=/admin');
  }

  if (!authContext.isAdmin) {
    notFound();
  }

  const users = await getAllUsers();

  return (
    <div className="py-8 md:py-12">
      <section className="mx-auto max-w-6xl space-y-8">

        <div className="space-y-2">
          <Badge variant="secondary">Admin Dashboard</Badge>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl">
            Control Center
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Manage recipes, moderate content, and track engagement across Sui at Home.
          </p>
        </div>

        <AdminNav />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Users
            </h2>
          </div>
          <UserManagementPanel initialUsers={users} />
        </div>

      </section>
    </div>
  );
}
