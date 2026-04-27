import { NextRequest, NextResponse } from 'next/server';
import { getPublicRecipesPageData } from '@/lib/supabase/public-recipes';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10));
  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('categoryId') ?? 'all';

  try {
    const { recipes, hasMore } = await getPublicRecipesPageData({ page, search, categoryId });
    return NextResponse.json({ recipes, hasMore });
  } catch {
    return NextResponse.json({ recipes: [], hasMore: false }, { status: 500 });
  }
}
