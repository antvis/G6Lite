import type { Locale } from '@/lib/i18n';
import { QuickStartExample } from './quick-start-example';

export function GraphDataModelDiagram({ locale }: { locale: Locale }) {
  return <QuickStartExample locale={locale} variant="data-model" />;
}
