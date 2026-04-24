import { notFound, redirect } from 'next/navigation';

import { AdminNav } from '@/components/layout/admin-nav';
import { Badge } from '@/components/ui/badge';
import { getAuthContext } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/config';

import { FoodRequestsPanel } from './food-requests-panel';

export type FoodRequest = {
  id: string;
  food_name: string;
  country: string;
  photo_url: string | null;
  status: 'pending' | 'reviewed' | 'completed';
  created_at: string;
  user_email: string | null;
  user_name: string | null;
};

export type RequesterSummary = {
  user_email: string;
  user_name: string | null;
  count: number;
  foods: string[];
};

export type CountrySummary = {
  country: string;
  count: number;
};

export type FoodSummary = {
  food_name: string;
  count: number;
};

async function getFoodRequestData() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from('food_requests')
    .select('id, food_name, country, photo_url, status, created_at, user_email, user_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[food-requests admin]', error);
    return { requests: [], requesters: [], byCountry: [], byFood: [], stats: { total: 0, pending: 0, uniqueUsers: 0 } };
  }

  // Fetch profile names separately (no direct FK from food_requests → profiles)
  const userIds = [...new Set((rows ?? []).map((r: any) => r.user_id).filter(Boolean))];
  const profileMap = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds);
    for (const p of profiles ?? []) profileMap.set(p.id, p.name ?? null);
  }

  const requests: FoodRequest[] = (rows ?? []).map((r: any) => ({
    id: r.id,
    food_name: r.food_name,
    country: r.country,
    photo_url: r.photo_url,
    status: r.status,
    created_at: r.created_at,
    user_email: r.user_email,
    user_name: profileMap.get(r.user_id) ?? null,
  }));

  // Group by requester
  const requesterMap = new Map<string, RequesterSummary>();
  for (const r of requests) {
    const key = r.user_email ?? 'unknown';
    const existing = requesterMap.get(key);
    if (existing) {
      existing.count++;
      if (!existing.foods.includes(r.food_name)) existing.foods.push(r.food_name);
    } else {
      requesterMap.set(key, {
        user_email: key,
        user_name: r.user_name,
        count: 1,
        foods: [r.food_name],
      });
    }
  }
  const requesters = Array.from(requesterMap.values()).sort((a, b) => b.count - a.count);

  // Group by country
  const countryMap = new Map<string, number>();
  for (const r of requests) {
    countryMap.set(r.country, (countryMap.get(r.country) ?? 0) + 1);
  }
  const byCountry: CountrySummary[] = Array.from(countryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Group by food name
  const foodMap = new Map<string, number>();
  for (const r of requests) {
    const key = r.food_name.toLowerCase();
    foodMap.set(key, (foodMap.get(key) ?? 0) + 1);
  }
  const byFood: FoodSummary[] = Array.from(foodMap.entries())
    .map(([food_name, count]) => ({ food_name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    uniqueUsers: requesterMap.size,
  };

  return { requests, requesters, byCountry, byFood, stats };
}

export default async function AdminFoodRequestsPage() {
  if (!hasSupabaseEnv()) {
    redirect('/login?error=Add%20your%20Supabase%20env%20vars%20first.');
  }

  const authContext = await getAuthContext();

  if (!authContext.isLoggedIn) {
    redirect('/login?next=/admin/food-requests');
  }

  if (!authContext.isAdmin) {
    notFound();
  }

  const { requests, requesters, byCountry, byFood, stats } = await getFoodRequestData();

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-3">
          <Badge variant="secondary">Admin</Badge>
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl">
              Food Requests
            </h1>
            <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
              See what foods users are requesting, who's asking, and how often.
            </p>
          </div>
        </div>

        <AdminNav />

        <FoodRequestsPanel
          requests={requests}
          requesters={requesters}
          byCountry={byCountry}
          byFood={byFood}
          stats={stats}
        />
      </div>
    </div>
  );
}
