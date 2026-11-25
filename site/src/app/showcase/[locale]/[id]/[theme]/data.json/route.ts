import { createShowcaseCode } from '@/components/homepage/showcase-code.server';
import {
  showcaseIds,
  type ShowcaseId,
  type ShowcaseTheme,
} from '@/components/homepage/showcase-catalog';
import type { Locale } from '@/lib/i18n';

export const dynamic = 'force-static';
export const dynamicParams = false;

type Params = { locale: Locale; id: ShowcaseId; theme: ShowcaseTheme };

export function generateStaticParams(): Params[] {
  return (['zh', 'en'] as const).flatMap((locale) =>
    showcaseIds.flatMap((id) =>
      (['light', 'dark'] as const).map((theme) => ({ locale, id, theme })),
    ),
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; id: string; theme: string }> },
) {
  const { locale, id, theme } = await params;
  const selected = showcaseIds.find((value) => value === id);
  if (!selected || (locale !== 'zh' && locale !== 'en') || (theme !== 'light' && theme !== 'dark')) {
    return new Response('Not found', { status: 404 });
  }
  return Response.json(await createShowcaseCode(selected, locale, theme));
}
