function isPlaceholderValue(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  return (
    normalizedValue.length === 0 ||
    normalizedValue.includes('your-project-url') ||
    normalizedValue.includes('your-publishable-key') ||
    normalizedValue.includes('paste_the_real') ||
    normalizedValue.includes('replace-me')
  );
}

export function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabasePublishableKey ||
    isPlaceholderValue(supabaseUrl) ||
    isPlaceholderValue(supabasePublishableKey)
  ) {
    return null;
  }

  return { supabaseUrl, supabasePublishableKey };
}

export function hasSupabaseEnv() {
  return Boolean(getSupabaseEnv());
}
