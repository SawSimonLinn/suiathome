import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAuthContext } from '@/lib/supabase/auth';
import { getCommentModerationData } from '@/lib/supabase/admin';
import { hasSupabaseEnv } from '@/lib/supabase/config';

import { CommentModerationPanel } from './moderation-panel';

export default async function AdminCommentsPage() {
  if (!hasSupabaseEnv()) {
    redirect('/login?error=Add%20your%20Supabase%20env%20vars%20first.');
  }

  const authContext = await getAuthContext();

  if (!authContext.isLoggedIn) {
    redirect('/login?next=/admin/comments');
  }

  if (!authContext.isAdmin) {
    notFound();
  }

  const moderationData = await getCommentModerationData();

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary">Admin Moderation</Badge>
            <div>
              <h1 className="font-headline text-4xl md:text-5xl">
                Comment Controls
              </h1>
              <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
                This is where comment removal and hide/unhide controls live for
                recipe pages and community posts.
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Moderation Notes</CardTitle>
            <CardDescription>
              Delete removes a comment entirely. Hide keeps it in the database
              but marks it as hidden for future public views.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>
              If hide/unhide is disabled, run
              {' '}
              `docs/supabase-admin-upgrade.sql`
              {' '}
              in Supabase first so the `is_hidden` columns and admin moderation
              policies exist.
            </p>
            <p>
              Once the public recipe/community pages are fully reading from
              Supabase, hidden comments can be filtered out of those views.
            </p>
          </CardContent>
        </Card>

        <CommentModerationPanel
          recipeComments={moderationData.recipeComments}
          communityComments={moderationData.communityComments}
          hiddenModerationReady={moderationData.hiddenModerationReady}
        />
      </div>
    </div>
  );
}
