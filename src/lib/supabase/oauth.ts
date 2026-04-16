export const GOOGLE_AUTH_REDIRECT_URL = () => `${window.location.origin}/auth/callback`;

export const OAUTH_NEXT_COOKIE = 'suiathome-oauth-next';
export const OAUTH_LEGAL_CONSENT_COOKIE = 'suiathome-oauth-legal-consent';
export const OAUTH_STATE_COOKIE_MAX_AGE_SECONDS = 60 * 10;

export function serializeOAuthStateCookie(name: string, value: string) {
  return `${name}=${encodeURIComponent(value)}; Max-Age=${OAUTH_STATE_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}
