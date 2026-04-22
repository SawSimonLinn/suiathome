import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_LOCATIONS = ['Los Angeles', 'Washington DC', 'Texas', 'Other'] as const;

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('restaurant_interest_votes')
      .select('location');

    if (error) throw error;

    const counts: Record<string, number> = {
      'Los Angeles': 0,
      'Washington DC': 0,
      'Texas': 0,
      'Other': 0,
    };
    for (const row of data ?? []) {
      if (row.location in counts) counts[row.location]++;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    let userVote: string | null = null;
    if (user) {
      const { data: voteRow } = await supabase
        .from('restaurant_interest_votes')
        .select('location')
        .eq('user_id', user.id)
        .maybeSingle();
      userVote = voteRow?.location ?? null;
    }

    return NextResponse.json({ counts, total, userVote, isLoggedIn: !!user });
  } catch (err) {
    console.error('[restaurant-votes GET]', err);
    return NextResponse.json({ counts: { 'Los Angeles': 0, 'Washington DC': 0, 'Texas': 0, 'Other': 0 }, total: 0, userVote: null, isLoggedIn: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to vote.' }, { status: 401 });
    }

    const body = await req.json();
    const { location, suggestion } = body;

    if (!VALID_LOCATIONS.includes(location)) {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
    }

    const { error } = await supabase
      .from('restaurant_interest_votes')
      .insert({ user_id: user.id, location, suggestion: suggestion || null });

    if (error) {
      // Unique constraint violation - already voted
      if (error.code === '23505') {
        return NextResponse.json({ error: 'already_voted' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[restaurant-votes POST]', err);
    return NextResponse.json({ error: 'Failed to save vote' }, { status: 500 });
  }
}
