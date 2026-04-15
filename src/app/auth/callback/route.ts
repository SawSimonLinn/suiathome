import { NextResponse, type NextRequest } from 'next/server';

import { createLegalConsentMetadata } from '@/lib/legal';
import { createClient } from '@/lib/supabase/server';

function getNextPath(next: string | null) {
  if (!next || !next.startsWith('/')) {
    return '/profile';
  }

  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = getNextPath(searchParams.get('next'));
  const privacyAccepted = searchParams.get('privacyAccepted') === 'true';
  const termsAccepted = searchParams.get('termsAccepted') === 'true';
  const providerError =
    searchParams.get('error_description') || searchParams.get('error');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (privacyAccepted && termsAccepted) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase.auth.updateUser({
            data: {
              ...(user.user_metadata ?? {}),
              ...createLegalConsentMetadata(),
            },
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  if (providerError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(providerError)}`
    );
  }

  return NextResponse.redirect(
    `${origin}/login?error=Missing%20OAuth%20authorization%20code.`
  );
}
