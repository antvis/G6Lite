import { defineI18n } from 'fumadocs-core/i18n';

import { languages } from './localized-path';

export { localizedDocsPath, localizedPath, type Locale } from './localized-path';

export const i18n = defineI18n({
  languages: [...languages],
  defaultLanguage: 'zh',
  parser: 'dir',
  fallbackLanguage: 'zh',
});
