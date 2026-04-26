import { NextRequest, NextResponse } from 'next/server';
import { getPublicCommunityPostsPage } from '@/lib/supabase/public-community';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10));

  try {
    const result = await getPublicCommunityPostsPage(page);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ posts: [], hasMore: false }, { status: 500 });
  }
}
