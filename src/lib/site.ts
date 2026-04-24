export const SITE_DOMAIN = 'suiathome.com';
export const SITE_URL = `https://${SITE_DOMAIN}`;

export const CONTACT_EMAIL = 'hello@suiathome.com';
export const COLLAB_EMAIL = 'suiathome.collab@gmail.com';

export type SiteSocialPlatform = 'instagram' | 'tiktok' | 'facebook' | 'linkedin';

export type SiteSocialLink = {
  platform: SiteSocialPlatform;
  label: string;
  href: string;
};

export const SITE_SOCIAL_LINKS: SiteSocialLink[] = [
  {
    platform: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/sui.at.home',
  },
  {
    platform: 'tiktok',
    label: 'TikTok',
    href: 'https://www.tiktok.com/@suiathome',
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/suiathome',
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/sawsimonlinn/',
  },
];
