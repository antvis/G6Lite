export const appName = 'G6-GL';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

/** Prefix an absolute site path for deployments hosted below a domain subpath. */
export function withBasePath(path: string): string {
  const absolutePath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${absolutePath}`;
}

export const gitConfig = {
  user: 'antvis',
  repo: 'G6Lite',
  branch: 'master',
};
