export type DomainMode = 'path' | 'subdomain';

const mode = (import.meta.env.VITE_DOMAIN_MODE || 'path') as DomainMode;
const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'nexusnfc.com';
const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;

export const domainLib = {
  mode, rootDomain, baseUrl,
  buildPublicUrl: (slug: string) =>
    mode === 'subdomain'
      ? `${baseUrl.startsWith('https') ? 'https' : 'http'}://${slug}.${rootDomain}`
      : `${baseUrl}/u/${slug}`,
  getSubdomainSlug: (): string | null => {
    if (mode !== 'subdomain') return null;
    const parts = window.location.hostname.split('.');
    return parts.length >= 3 && parts[0] !== 'www' ? parts[0] : null;
  },
};
