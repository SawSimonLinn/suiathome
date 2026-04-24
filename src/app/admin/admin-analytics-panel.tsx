'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  AnalyticsTrendPoint,
  TopRecipeMetric,
} from '@/lib/supabase/admin';

type AdminAnalyticsPanelProps = {
  engagementTrend: AnalyticsTrendPoint[];
  topRecipes: TopRecipeMetric[];
};

const engagementChartConfig = {
  likes: {
    label: 'Likes',
    color: '#F2C258',
  },
  favorites: {
    label: 'Favorites',
    color: '#F0B593',
  },
  comments: {
    label: 'Comments',
    color: '#B4E194',
  },
} satisfies ChartConfig;

const recipeBreakdownConfig = {
  likes: {
    label: 'Likes',
    color: '#F2C258',
  },
  favorites: {
    label: 'Favorites',
    color: '#F0B593',
  },
  comments: {
    label: 'Comments',
    color: '#B4E194',
  },
} satisfies ChartConfig;

function truncateTitle(title: string) {
  const englishPart = title.includes('(') ? title.split('(')[0].trim() : title;
  return englishPart.length > 26 ? `${englishPart.slice(0, 26)}...` : englishPart;
}

const PAGE_SIZE = 10;

export function AdminAnalyticsPanel({
  engagementTrend,
  topRecipes,
}: AdminAnalyticsPanelProps) {
  const [page, setPage] = useState(0);

  const hasTrendData = engagementTrend.some(
    (point) =>
      point.likes > 0 ||
      point.comments > 0 ||
      point.favorites > 0
  );
  const hasTopRecipes = topRecipes.length > 0;

  const totalPages = Math.ceil(topRecipes.length / PAGE_SIZE);
  const pageRecipes = topRecipes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="grid gap-4 sm:gap-6">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="overflow-hidden">
          {hasTrendData ? (
            <ChartContainer
              config={engagementChartConfig}
              className="min-h-[180px] sm:min-h-[280px] w-full"
            >
              <LineChart data={engagementTrend} margin={{ left: 4, right: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis allowDecimals={false} width={24} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke="var(--color-likes)"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="favorites"
                  stroke="var(--color-favorites)"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke="var(--color-comments)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex min-h-[180px] sm:min-h-[280px] items-center justify-center border-2 border-foreground bg-paper p-6 text-center text-sm text-muted-foreground paper-shadow">
              Once users start liking, favoriting, and commenting on real Supabase-backed
              recipes, this engagement trend chart will populate automatically.
            </div>
          )}
        </div>

        <div className="overflow-hidden">
          {hasTopRecipes ? (
            <ChartContainer
              config={recipeBreakdownConfig}
              className="min-h-[180px] sm:min-h-[280px] w-full"
            >
              <BarChart
                data={topRecipes.map((recipe) => ({
                  ...recipe,
                  shortTitle: truncateTitle(recipe.title),
                }))}
                margin={{ left: 4, right: 4, top: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="shortTitle"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={48}
                />
                <YAxis allowDecimals={false} width={24} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="likes" fill="var(--color-likes)" radius={0} />
                <Bar
                  dataKey="favorites"
                  fill="var(--color-favorites)"
                  radius={0}
                />
                <Bar
                  dataKey="comments"
                  fill="var(--color-comments)"
                  radius={0}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex min-h-[180px] sm:min-h-[280px] items-center justify-center border-2 border-foreground bg-paper p-6 text-center text-sm text-muted-foreground paper-shadow">
              Top-recipe analytics will appear here after the first likes, favorites,
              and comments hit your database.
            </div>
          )}
        </div>
      </div>

      <div className="border-2 border-foreground bg-paper paper-shadow">
        <ScrollArea className="w-full whitespace-nowrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipe</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Favorites</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasTopRecipes ? (
                pageRecipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/recipes/${recipe.slug}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {recipe.title}
                      </Link>
                    </TableCell>
                    <TableCell>{recipe.likes}</TableCell>
                    <TableCell>{recipe.favorites}</TableCell>
                    <TableCell>{recipe.comments}</TableCell>
                    <TableCell>{recipe.views}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No recipes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t-2 border-foreground px-4 py-2 text-sm">
            <span className="text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 border border-foreground disabled:opacity-40 hover:bg-foreground hover:text-background transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-3 py-1 border border-foreground disabled:opacity-40 hover:bg-foreground hover:text-background transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
