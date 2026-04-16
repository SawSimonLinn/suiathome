import type { SocialLink } from '@/lib/supabase/auth';

const PLATFORM_META: Record<string, { label: string }> = {
  instagram: { label: 'Instagram' },
  twitter: { label: 'X / Twitter' },
  youtube: { label: 'YouTube' },
  tiktok: { label: 'TikTok' },
  facebook: { label: 'Facebook' },
  website: { label: 'Website' },
  custom: { label: 'Link' },
};

function getPlatformMeta(platform: string) {
  return PLATFORM_META[platform] ?? { label: platform };
}

function parseLinkUrl(url: string) {
  const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;

  try {
    return new URL(normalizedUrl);
  } catch {
    return null;
  }
}

function getHostname(url: string) {
  return parseLinkUrl(url)?.hostname.replace(/^www\./, '') ?? '';
}

function getFaviconUrl(url: string) {
  const hostname = getHostname(url);

  if (!hostname) {
    return null;
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
}

function getPathSegments(url: string) {
  const pathname = parseLinkUrl(url)?.pathname ?? '';
  return pathname.split('/').filter(Boolean).map((segment) => decodeURIComponent(segment).trim());
}

function getUsernameLabel(link: SocialLink) {
  const [firstSegment, secondSegment] = getPathSegments(link.url);

  switch (link.platform) {
    case 'instagram':
    case 'twitter':
    case 'facebook': {
      if (!firstSegment) return null;
      return `@${firstSegment.replace(/^@/, '')}`;
    }
    case 'youtube': {
      if (!firstSegment) return null;
      if (firstSegment.startsWith('@')) {
        return firstSegment;
      }
      if (
        ['channel', 'c', 'user'].includes(firstSegment.toLowerCase()) &&
        secondSegment
      ) {
        return `@${secondSegment.replace(/^@/, '')}`;
      }
      if (firstSegment !== 'watch') {
        return `@${firstSegment.replace(/^@/, '')}`;
      }
      return null;
    }
    case 'tiktok': {
      if (!firstSegment) return null;
      return `@${firstSegment.replace(/^@/, '')}`;
    }
    default:
      return null;
  }
}

function getDisplayLabel(link: SocialLink): string {
  if (link.platform === 'custom' && link.label?.trim()) {
    return link.label.trim();
  }

  const usernameLabel = getUsernameLabel(link);
  if (usernameLabel) {
    return usernameLabel;
  }

  const hostname = getHostname(link.url);
  if (hostname) {
    return hostname;
  }

  return getPlatformMeta(link.platform).label;
}

function getFallbackBadge(label: string) {
  const initial = label.replace(/^@/, '').trim().charAt(0).toUpperCase() || '?';

  return (
    <span
      aria-hidden="true"
      className="flex h-4 w-4 items-center justify-center rounded-sm bg-secondary text-[10px] font-semibold text-foreground"
    >
      {initial}
    </span>
  );
}

export function ProfileSocialLinks({ links }: { links: SocialLink[] }) {
  const visible = links.filter((link) => link.url.trim());

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((link, index) => {
        const displayLabel = getDisplayLabel(link);
        const faviconUrl = getFaviconUrl(link.url);

        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-foreground bg-paper px-3 py-1 text-sm font-medium paper-shadow-sm transition-colors hover:bg-secondary"
            title={displayLabel}
          >
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 shrink-0 rounded-sm"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              getFallbackBadge(displayLabel)
            )}
            <span className="max-w-[12rem] truncate">{displayLabel}</span>
          </a>
        );
      })}
    </div>
  );
}
