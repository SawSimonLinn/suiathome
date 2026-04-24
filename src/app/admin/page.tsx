import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  MessageSquare,
  Tag,
  Users,
  TrendingUp,
  Eye,
  Heart,
  UtensilsCrossed,
} from 'lucide-react';

import { AdminNav } from '@/components/layout/admin-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const statIcons = [Users, BookOpen, Heart, Eye];

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
      <section className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
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

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {dashboardData.stats.map((stat, i) => {
            const Icon = statIcons[i] ?? TrendingUp;
            return (
              <Card key={stat.label}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      {stat.label}
                    </CardDescription>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl">
                    {stat.value === null ? '-' : stat.value.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <Card className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md border-2 border-foreground bg-paper paper-shadow-sm">
                  <BookOpen className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">Recipes</CardTitle>
                <CardDescription>
                  Upload new recipes or edit, hide, and delete existing ones.
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto flex gap-2">
                <Button asChild size="sm">
                  <Link href="/admin/recipes">Manage Recipes</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md border-2 border-foreground bg-paper paper-shadow-sm">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">Comments</CardTitle>
                <CardDescription>
                  Review, hide, or permanently delete user comments.
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/comments">Moderate Comments</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md border-2 border-foreground bg-paper paper-shadow-sm">
                  <Tag className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">Categories</CardTitle>
                <CardDescription>
                  Create and organize the categories recipes are grouped under.
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/categories">Manage Categories</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md border-2 border-foreground bg-paper paper-shadow-sm">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">Food Requests</CardTitle>
                <CardDescription>
                  See what foods users are asking for, who's requesting them, and track status.
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/food-requests">View Requests</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col sm:col-span-2 lg:col-span-3">
              <CardHeader>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md border-2 border-foreground bg-paper paper-shadow-sm">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">Analytics</CardTitle>
                <CardDescription>
                  Track likes, favorites, and comments over time. See which recipes
                  are driving the most engagement.
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/analytics">View Analytics</Link>
                </Button>
              </CardFooter>
            </Card>

          </div>
        </div>

        {/* Recent Profiles */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Recent Sign-ups
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
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
                          <TableCell className="text-muted-foreground">
                            {profile.created_at
                              ? new Date(profile.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-muted-foreground">
                          No profiles yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

      </section>
    </div>
  );
}
