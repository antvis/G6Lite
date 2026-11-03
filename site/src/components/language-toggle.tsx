'use client';

import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import type { LanguageSelectProps } from 'fumadocs-ui/layouts/shared/slots/language-select';

export function LanguageToggle({ className, variant = 'ghost', children, ...props }: LanguageSelectProps) {
  const { locale, onChange } = useI18n();
  const next = locale === 'zh' ? 'en' : 'zh';

  return (
    <button
      type="button"
      aria-label={next === 'en' ? 'Switch to English' : '切换到中文'}
      className={`${buttonVariants({ variant })} gap-1.5 p-1.5${className ? ` ${className}` : ''}`}
      onClick={() => onChange?.(next)}
      {...props}
    >
      {children}
    </button>
  );
}
