import { defineI18n } from 'fumadocs-core/i18n';

export const i18n = defineI18n({
  languages: ['zh', 'en'],
  defaultLanguage: 'zh',
  parser: 'dot',
  fallbackLanguage: 'zh',
});

export type Locale = (typeof i18n.languages)[number];

export function localizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'zh') return normalized;
  return normalized === '/' ? '/en' : `/en${normalized}`;
}

export function localizedDocsPath(slugs: string[], locale: Locale): string {
  const suffix = slugs.length > 0 ? `/${slugs.join('/')}` : '';
  return localizedPath(`/docs${suffix}`, locale);
}
