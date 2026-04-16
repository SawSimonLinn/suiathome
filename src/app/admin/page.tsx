import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { AdminAnalyticsPanel } from '@/app/admin/admin-analytics-panel';
import { AdminNav } from '@/components/layout/admin-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAuthContext } from '@/lib/supabase/auth';
import { getAdminDashboardData } from '@/lib/supabase/admin';
import { hasSupabaseEnv } from '@/lib/supabase/config';

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

  const dashboardData = await getAdminDashboardData();

  return (
    <div className="py-8 md:py-12">
      <section className="mx-auto max-w-6xl">
        <div className="space-y-3">
          <Badge variant="secondary">Admin Dashboard</Badge>
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl">
              Control Center
            </h1>
            <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
              Track recipe engagement, publish new content, moderate comments,
              and manage the editorial side of Sui at home from one place.
            </p>
          </div>
        </div>

        <AdminNav />

        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
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

        <div className="mt-8 grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipe Analytics</CardTitle>
              <CardDescription>
                These charts summarize how many users like, favorite, and
                comment on recipes stored in Supabase.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 py-4 sm:px-6 sm:py-6">
              <AdminAnalyticsPanel
                engagementTrend={dashboardData.engagementTrend}
                topRecipes={dashboardData.topRecipes}
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <CardTitle>Recent Profiles</CardTitle>
                <CardDescription>
                  Quick visibility into who has signed up and which accounts are admins.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.recentProfiles.length > 0 ? (
                      dashboardData.recentProfiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">
                            {profile.name || 'Unnamed user'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={profile.role === 'admin' ? 'default' : 'outline'}
                            >
                              {profile.role || 'user'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {profile.created_at
                              ? new Date(profile.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Unknown'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-muted-foreground">
                          No profile rows found yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-4">
                <div>
                  <CardTitle>Admin Workflows</CardTitle>
                  <CardDescription>
                    This is where the admin-facing editing and moderation controls live.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/admin/recipes/new">Upload Recipe</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/admin/recipes">Edit Uploaded Recipes</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/admin/comments">Moderate Comments</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm text-muted-foreground">
                <div className="border-2 border-foreground bg-paper p-4 paper-shadow-sm">
                  <p className="font-medium text-foreground">Upload recipes</p>
                  <p className="mt-1">
                    Use
                    {' '}
                    <Link href="/admin/recipes/new" className="underline hover:text-foreground">
                      /admin/recipes/new
                    </Link>
                    {' '}
                    to publish new recipes with title, story, ingredients, steps,
                    tips, and category details.
                  </p>
                </div>
                <div className="border-2 border-foreground bg-paper p-4 paper-shadow-sm">
                  <p className="font-medium text-foreground">Remove or hide comments</p>
                  <p className="mt-1">
                    Use
                    {' '}
                    <Link href="/admin/comments" className="underline hover:text-foreground">
                      /admin/comments
                    </Link>
                    {' '}
                    to delete comments completely or hide/unhide them once the
                    admin upgrade SQL is applied.
                  </p>
                </div>
                <div className="border-2 border-foreground bg-paper p-4 paper-shadow-sm">
                  <p className="font-medium text-foreground">Edit uploaded recipes</p>
                  <p className="mt-1">
                    Use
                    {' '}
                    <Link href="/admin/recipes" className="underline hover:text-foreground">
                      /admin/recipes
                    </Link>
                    {' '}
                    to review existing recipes, open them in the editor, and save updated copy,
                    ingredients, steps, tips, and images.
                  </p>
                </div>
                <div className="border-2 border-foreground bg-paper p-4 paper-shadow-sm">
                  <p className="font-medium text-foreground">Enable admin policies</p>
                  <p className="mt-1">
                    Run `docs/supabase-admin-upgrade.sql` in Supabase if you
                    have not already. That file enables admin
                    recipe management and hidden comment moderation.
                  </p>
                </div>
                <div className="border-2 border-foreground bg-paper p-4 paper-shadow-sm">
                  <p className="font-medium text-foreground">More detail features</p>
                  <p className="mt-1">
                    The admin recipe tools now cover create, review, and edit flows
                    with multi-image previews. Next up can be drafts, image
                    cleanup, and richer version history.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
