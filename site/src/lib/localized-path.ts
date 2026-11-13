export const languages = ['zh', 'en'] as const;

export type Locale = (typeof languages)[number];

export function localizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'zh') return normalized;
  return normalized === '/' ? '/en' : `/en${normalized}`;
}

export function localizedDocsPath(slugs: string[], locale: Locale): string {
  const suffix = slugs.length > 0 ? `/${slugs.join('/')}` : '';
  return localizedPath(`/docs${suffix}`, locale);
}
