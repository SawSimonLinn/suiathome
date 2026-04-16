import { NextResponse, type NextRequest } from 'next/server';

import { createLegalConsentMetadata } from '@/lib/legal';
import {
  OAUTH_LEGAL_CONSENT_COOKIE,
  OAUTH_NEXT_COOKIE,
} from '@/lib/supabase/oauth';
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
  const next = getNextPath(request.cookies.get(OAUTH_NEXT_COOKIE)?.value ?? null);
  const hasAcceptedLegal =
    request.cookies.get(OAUTH_LEGAL_CONSENT_COOKIE)?.value === 'true';
  const providerError =
    searchParams.get('error_description') || searchParams.get('error');

  const redirectWithClearedOAuthState = (path: string) => {
    const response = NextResponse.redirect(`${origin}${path}`);
    response.cookies.delete(OAUTH_NEXT_COOKIE);
    response.cookies.delete(OAUTH_LEGAL_CONSENT_COOKIE);
    return response;
  };

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Keep provider redirects on an exact callback URL and read app state from cookies.
      if (hasAcceptedLegal) {
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

      return redirectWithClearedOAuthState(next);
    }

    return redirectWithClearedOAuthState(
      `/login?error=${encodeURIComponent(error.message)}`
    );
  }

  if (providerError) {
    return redirectWithClearedOAuthState(
      `/login?error=${encodeURIComponent(providerError)}`
    );
  }

  return redirectWithClearedOAuthState(
    '/login?error=Missing%20OAuth%20authorization%20code.'
  );
}
