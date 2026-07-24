import type { Locale } from './i18n';
import { localizedPath } from './i18n';
import { siteConfig } from './site-config';

export const appName = siteConfig.name;

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

/** Prefix an absolute site path for deployments hosted below a domain subpath. */
export function withBasePath(path: string): string {
  const absolutePath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${absolutePath}`;
}

export function docsImageRoute(locale: Locale): string {
  return localizedPath('/og/docs', locale);
}

export function docsContentRoute(locale: Locale): string {
  return localizedPath('/llms.mdx/docs', locale);
}

export const gitConfig = {
  user: 'antvis',
  repo: 'G6Lite',
  branch: 'master',
};
