import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseEnv } from '@/lib/supabase/config';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const env = getSupabaseEnv();

  if (!env) {
    return response;
  }

  const supabase = createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            // Keep auth cookies alive for 1 year so users stay logged in
            // unless they explicitly sign out.
            maxAge: options?.maxAge ?? 60 * 60 * 24 * 365,
          });
        });
      },
    },
  });

  // Keep this immediately after createServerClient so auth cookies stay fresh.
  await supabase.auth.getClaims();

  return response;
}
