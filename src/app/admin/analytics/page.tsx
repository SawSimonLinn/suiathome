import { notFound, redirect } from 'next/navigation';

import { AdminAnalyticsPanel } from '@/app/admin/admin-analytics-panel';
import { AdminNav } from '@/components/layout/admin-nav';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAuthContext } from '@/lib/supabase/auth';
import { getAdminDashboardData } from '@/lib/supabase/admin';
import { hasSupabaseEnv } from '@/lib/supabase/config';

export default async function AdminAnalyticsPage() {
  if (!hasSupabaseEnv()) {
    redirect('/login?error=Add%20your%20Supabase%20env%20vars%20first.');
  }

  const authContext = await getAuthContext();

  if (!authContext.isLoggedIn) {
    redirect('/login?next=/admin/analytics');
  }

  if (!authContext.isAdmin) {
    notFound();
  }

  const dashboardData = await getAdminDashboardData();

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-3">
          <Badge variant="secondary">Admin Analytics</Badge>
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl">
              Analytics
            </h1>
            <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
              Track recipe engagement over time — likes, favorites, and comments
              across all your published content.
            </p>
          </div>
        </div>

        <AdminNav />

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {dashboardData.stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-2xl sm:text-4xl">
                  {stat.value === null ? 'Not Ready' : stat.value.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recipe Analytics</CardTitle>
            <CardDescription>
              These charts summarize how many users like, favorite, and comment
              on recipes stored in Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 py-4 sm:px-6 sm:py-6">
            <AdminAnalyticsPanel
              engagementTrend={dashboardData.engagementTrend}
              topRecipes={dashboardData.topRecipes}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
