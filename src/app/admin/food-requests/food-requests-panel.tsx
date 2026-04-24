'use client';

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FoodRequest, RequesterSummary, CountrySummary, FoodSummary } from './page';

const requesterChartConfig = {
  count: { label: 'Requests', color: '#647e61' },
} satisfies ChartConfig;

const countryChartConfig = {
  count: { label: 'Requests', color: '#c9b8d8' },
} satisfies ChartConfig;

const foodChartConfig = {
  count: { label: 'Requests', color: '#F2C258' },
} satisfies ChartConfig;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  completed: 'Completed',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  pending: 'secondary',
  reviewed: 'default',
  completed: 'outline',
};

type Props = {
  requests: FoodRequest[];
  requesters: RequesterSummary[];
  byCountry: CountrySummary[];
  byFood: FoodSummary[];
  stats: { total: number; pending: number; uniqueUsers: number };
};

export function FoodRequestsPanel({ requests, requesters, byCountry, byFood, stats }: Props) {
  const [localRequests, setLocalRequests] = useState<FoodRequest[]>(requests);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch('/api/food-request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setLocalRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: status as FoodRequest['status'] } : r))
        );
      }
    } finally {
      setUpdating(null);
    }
  }

  const topRequesters = requesters.slice(0, 10).map((r) => ({
    label: r.user_name ?? r.user_email.split('@')[0],
    count: r.count,
  }));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">Total Requests</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">Pending</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">Unique Users</CardDescription>
            <CardTitle className="text-3xl">{stats.uniqueUsers}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Requesters</CardTitle>
            <CardDescription>Users by number of requests</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {topRequesters.length > 0 ? (
              <ChartContainer config={requesterChartConfig} className="min-h-[200px] w-full">
                <BarChart data={topRequesters} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    width={72}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={0} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
                No requests yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Country</CardTitle>
            <CardDescription>Requests grouped by country of origin</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {byCountry.length > 0 ? (
              <ChartContainer config={countryChartConfig} className="min-h-[200px] w-full">
                <BarChart data={byCountry} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="country"
                    tick={{ fontSize: 10 }}
                    width={72}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={0} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
                No requests yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Requested Foods</CardTitle>
            <CardDescription>Top food names across all requests</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {byFood.length > 0 ? (
              <ChartContainer config={foodChartConfig} className="min-h-[200px] w-full">
                <BarChart data={byFood} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="food_name"
                    tick={{ fontSize: 10 }}
                    width={72}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={0} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
                No requests yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-user breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requests by User</CardTitle>
          <CardDescription>Who requested what and how many times</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-center">Count</TableHead>
                  <TableHead>Foods requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requesters.length > 0 ? (
                  requesters.map((r) => (
                    <TableRow key={r.user_email}>
                      <TableCell>
                        <div className="font-medium">{r.user_name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">{r.user_email}</div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{r.count}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {r.foods.map((f) => (
                            <Badge key={f} variant="outline" className="text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      No requests yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* All requests detail table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Requests</CardTitle>
          <CardDescription>Full list — update status or view photos</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Food</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Requested by</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localRequests.length > 0 ? (
                  localRequests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.food_name}</TableCell>
                      <TableCell>{r.country}</TableCell>
                      <TableCell>
                        <div>{r.user_name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">{r.user_email}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        {r.photo_url ? (
                          <a
                            href={r.photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline underline-offset-2 text-primary"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={r.status}
                          disabled={updating === r.id}
                          onValueChange={(val) => updateStatus(r.id, val)}
                        >
                          <SelectTrigger className="h-7 w-[110px] text-xs">
                            <SelectValue>
                              <Badge variant={STATUS_VARIANTS[r.status]} className="text-xs">
                                {STATUS_LABELS[r.status]}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      No food requests yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
