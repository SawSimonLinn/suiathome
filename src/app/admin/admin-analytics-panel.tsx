'use client';

import Link from 'next/link';
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
  return title.length > 26 ? `${title.slice(0, 26)}...` : title;
}

export function AdminAnalyticsPanel({
  engagementTrend,
  topRecipes,
}: AdminAnalyticsPanelProps) {
  const hasTrendData = engagementTrend.some(
    (point) =>
      point.likes > 0 ||
      point.comments > 0 ||
      point.favorites > 0
  );
  const hasTopRecipes = topRecipes.length > 0;

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          {hasTrendData ? (
            <ChartContainer
              config={engagementChartConfig}
              className="min-h-[320px] w-full"
            >
              <LineChart data={engagementTrend} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis allowDecimals={false} width={28} />
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
            <div className="flex min-h-[320px] items-center justify-center border bg-card p-6 text-center text-sm text-muted-foreground shadow-paper">
              Once users start liking, favoriting, and commenting on real Supabase-backed
              recipes, this engagement trend chart will populate automatically.
            </div>
          )}
        </div>

        <div>
          {hasTopRecipes ? (
            <ChartContainer
              config={recipeBreakdownConfig}
              className="min-h-[320px] w-full"
            >
              <BarChart
                data={topRecipes.map((recipe) => ({
                  ...recipe,
                  shortTitle: truncateTitle(recipe.title),
                }))}
                margin={{ left: 12, right: 12, top: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="shortTitle"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis allowDecimals={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="likes" fill="var(--color-likes)" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="favorites"
                  fill="var(--color-favorites)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="comments"
                  fill="var(--color-comments)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center border bg-card p-6 text-center text-sm text-muted-foreground shadow-paper">
              Top-recipe analytics will appear here after the first likes, favorites,
              and comments hit your database.
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-card shadow-paper">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipe</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Favorites</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasTopRecipes ? (
              topRecipes.map((recipe) => (
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
                  <TableCell>{recipe.total}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No recipe engagement has been recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
