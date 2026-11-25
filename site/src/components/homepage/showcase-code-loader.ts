import type { Locale } from '@/lib/i18n';
import type { ShowcaseCode, ShowcaseId, ShowcaseTheme } from './showcase-catalog';

const requests = new Map<string, Promise<ShowcaseCode>>();

/** Share pending and completed requests; a rejected request remains retryable. */
export function loadShowcaseCode(locale: Locale, id: ShowcaseId, theme: ShowcaseTheme) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const url = `${base}/showcase/${locale}/${id}/${theme}/data.json`;
  let request = requests.get(url);
  if (!request) {
    request = fetch(url).then(async (response) => {
      if (!response.ok) throw new Error(`Showcase code request failed: ${response.status}`);
      const code = (await response.json()) as ShowcaseCode;
      if (typeof code.source !== 'string' || typeof code.html !== 'string') {
        throw new Error('Invalid showcase code response');
      }
      return code;
    });
    requests.set(url, request);
    void request.catch(() => {
      if (requests.get(url) === request) requests.delete(url);
    });
  }
  return request;
}
