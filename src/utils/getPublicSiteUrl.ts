const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

/**
 * Returns the public, externally reachable base URL for auth email redirects.
 *
 * Prefer setting `VITE_PUBLIC_SITE_URL` in production builds to avoid generating
 * `localhost` / `capacitor://` / `file://` links inside emails.
 */
export const getPublicSiteUrl = (): string | null => {
  const envValue =
    (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined) ||
    (import.meta.env.VITE_SITE_URL as string | undefined);

  if (envValue && isHttpUrl(envValue)) return stripTrailingSlash(envValue);

  if (typeof window === 'undefined') return null;

  const { protocol, origin } = window.location;
  if (protocol === 'http:' || protocol === 'https:') return stripTrailingSlash(origin);

  return envValue ? stripTrailingSlash(envValue) : null;
};

