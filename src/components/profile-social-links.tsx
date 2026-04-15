import type { SocialLink } from '@/lib/supabase/auth';

const PLATFORM_META: Record<string, { label: string; icon: string; usernamePrefix?: string }> = {
  instagram: { label: 'Instagram', icon: '📷', usernamePrefix: 'instagram.com/' },
  twitter:   { label: 'X / Twitter', icon: '𝕏', usernamePrefix: 'x.com/' },
  youtube:   { label: 'YouTube', icon: '▶', usernamePrefix: 'youtube.com/@' },
  tiktok:    { label: 'TikTok', icon: '♪', usernamePrefix: 'tiktok.com/@' },
  facebook:  { label: 'Facebook', icon: 'f', usernamePrefix: 'facebook.com/' },
  website:   { label: 'Website', icon: '🔗' },
  custom:    { label: 'Link', icon: '🔗' },
};

function getPlatformMeta(platform: string) {
  return PLATFORM_META[platform] ?? { label: platform, icon: '🔗' };
}

function getDisplayLabel(link: SocialLink): string {
  const meta = getPlatformMeta(link.platform);
  if (link.platform === 'custom' && link.label) return link.label;
  if (meta.usernamePrefix) {
    const stripped = link.url.replace(/^https?:\/\//, '');
    if (stripped.startsWith(meta.usernamePrefix)) {
      return '@' + stripped.slice(meta.usernamePrefix.length);
    }
  }
  return meta.label;
}

export function ProfileSocialLinks({ links }: { links: SocialLink[] }) {
  const visible = links.filter((l) => l.url.trim());
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((link, i) => {
        const meta = getPlatformMeta(link.platform);
        return (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border-2 border-foreground bg-paper px-3 py-1 text-sm font-medium paper-shadow-sm transition-colors hover:bg-secondary"
          >
            <span aria-hidden="true">{meta.icon}</span>
            {getDisplayLabel(link)}
          </a>
        );
      })}
    </div>
  );
}
